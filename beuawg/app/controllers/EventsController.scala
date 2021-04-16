package controllers

import domain.values.AccessToken
import domain.values.Error._
import domain.values.GuestVeranstaltung
import domain.values.HostVeranstaltung
import domain.values.Id
import domain.values.Rsvp
import domain.values.Visibility._
import play.api.Environment
import play.api.libs.json.JsError
import play.api.libs.json.JsObject
import play.api.libs.json.Json
import play.api.libs.json.Reads
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request
import ports.Veranstaltungen

import java.time.ZoneId
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success
import scala.util.Try

import TransferObjects._

class EventsController @Inject() (implicit
    ec: ExecutionContext,
    val controllerComponents: ControllerComponents,
    val events: Veranstaltungen
) extends BaseController {

  def postEvent() = Action.async {

    events
      .publishVeranstaltung()
      .map(res =>
        Created(
          Json.obj(
            "id" -> res._1.wert,
            "hostToken" -> res._2.wert.toString
          )
        )
      )
  }

  private def toErrorResponse(error: Error): Status = error match {
    case domain.values.Error.NotFound => NotFound
    case AccessDenied                 => Forbidden
    case PrivateAccess                => Gone
    case ProtectedAccess              => Conflict
    case CommandIncomplete            => BadRequest
  }

  def getEvent(event: Id, view: String, timeZone: Option[String]) =
    Action.async { request =>
      Try(UUID.fromString(request.headers("X-Access-Token"))) match {
        case Success(accessToken) =>
          if ("host".equalsIgnoreCase(view)) {
            events
              .readHostVeranstaltung(
                event,
                AccessToken(accessToken)
              )
              .map(
                _.fold(
                  toErrorResponse(_),
                  hostVeranstaltung => Ok(Json.toJson(hostVeranstaltung))
                )
              )
          } else {
            Try(timeZone.map(ZoneId.of(_))) match { // TimeZone.getTimeZone(_) would resort to GMT in case of an unknown time zone
              case Success(timeZone) =>
                events
                  .readGuestVeranstaltung(
                    event,
                    AccessToken(accessToken),
                    timeZone
                  )
                  .map(
                    _.fold(
                      toErrorResponse(_),
                      guestVeranstaltung => Ok(Json.toJson(guestVeranstaltung))
                    )
                  )
              case Failure(exception) =>
                Future(BadRequest(exception.getMessage))
            }
          }
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
    }

  private def validateJson[A: Reads] = parse.json.validate(
    _.validate[A].asEither.left.map(e => BadRequest(JsError.toJson(e)))
  )

  def putEventVisibility(event: Id) = Action.async(validateJson[P]) { request =>
    Try(UUID.fromString(request.headers("X-Access-Token"))) match {
      case Success(accessToken) =>
        (request.body.visibility match {
          case Public =>
            events
              .republishVeranstaltung(
                event,
                AccessToken(accessToken)
              )
          case Protected =>
            events
              .protectVeranstaltung(
                event,
                AccessToken(accessToken)
              )
          case Private =>
            events
              .privatizeVeranstaltung(
                event,
                AccessToken(accessToken)
              )
        })
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def putEventText(event: Id) = Action.async(validateJson[Text]) { request =>
    Try(UUID.fromString(request.headers("X-Access-Token"))) match {
      case Success(accessToken) =>
        events
          .retextVeranstaltung(
            event,
            AccessToken(accessToken),
            request.body.name,
            request.body.description
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def putEventSchedule(event: Id) = Action.async(validateJson[Schedule]) {
    request =>
      Try(UUID.fromString(request.headers("X-Access-Token"))) match {
        case Success(accessToken) =>
          events
            .rescheduleVeranstaltung(
              event,
              AccessToken(accessToken),
              request.body.date,
              request.body.time,
              request.body.timeZone
            )
            .map(
              _.fold(
                toErrorResponse(_),
                _ => NoContent
              )
            )
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
  }

  def putEventLocation(event: Id) = Action.async(validateJson[Location]) {
    request =>
      Try(UUID.fromString(request.headers("X-Access-Token"))) match {
        case Success(accessToken) =>
          events
            .relocateVeranstaltung(
              event,
              AccessToken(accessToken),
              request.body.url,
              request.body.place
            )
            .map(
              _.fold(
                toErrorResponse(_),
                _ => NoContent
              )
            )
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
  }

  def patchEvent(event: Id) = Action.async(validateJson[Calibration]) {
    request =>
      Try(UUID.fromString(request.headers("X-Access-Token"))) match {
        case Success(accessToken) =>
          events
            .recalibrateVeranstaltung(
              event,
              AccessToken(accessToken),
              request.body.emailAddressRequired,
              request.body.phoneNumberRequired,
              request.body.plus1Allowed
            )
            .map(
              _.fold(
                toErrorResponse(_),
                _ => NoContent
              )
            )
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
  }

  def deleteEvent(event: Id) = Action.async { request =>
    Try(UUID.fromString(request.headers("X-Access-Token"))) match {
      case Success(accessToken) =>
        events
          .deleteVeranstaltung(
            event,
            AccessToken(accessToken)
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def postRsvp(event: Id) = Action.async(validateJson[Rsvp]) { request =>
    Try(UUID.fromString(request.headers("X-Access-Token"))) match {
      case Success(accessToken) =>
        events
          .rsvp(
            event,
            AccessToken(accessToken),
            request.body.name,
            request.body.emailAddress,
            request.body.phoneNumber,
            request.body.attendance
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }
}
