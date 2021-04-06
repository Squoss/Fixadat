package controllers

import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success
import scala.util.Try

import domain.values.AccessToken
import domain.values.Error._
import domain.values.GuestVeranstaltung
import domain.values.HostVeranstaltung
import domain.values.Id
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

import TransferObjects._

class EventsController @Inject() (implicit
    ec: ExecutionContext,
    val controllerComponents: ControllerComponents,
    val events: Veranstaltungen
) extends BaseController {

  def todo(event: Int) = TODO

  def postEvent() = Action.async {

    events
      .openVeranstaltung()
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
    case domain.values.Error.Gone     => Gone
    case AccessDenied                 => Forbidden
    case BadCommand                   => BadRequest
  }

  def getEvent(event: Int) = Action.async { request =>
    Try(UUID.fromString(request.headers("X-Access-Token"))) match {
      case Success(accessToken) =>
        events
          .readVeranstaltung(
            Id(event),
            AccessToken(accessToken)
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ match {
                case gv: GuestVeranstaltung => Ok(Json.toJson(gv))
                case hv: HostVeranstaltung  => Ok(Json.toJson(hv))
              }
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  private def validateJson[A: Reads] = parse.json.validate(
    _.validate[A].asEither.left.map(e => BadRequest(JsError.toJson(e)))
  )

  def putEventText(event: Int) = Action.async(validateJson[Text]) { request =>
    Try(UUID.fromString(request.headers("X-Access-Token"))) match {
      case Success(accessToken) =>
        events
          .retextVeranstaltung(
            Id(event),
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

  def putEventSchedule(event: Int) = Action.async(validateJson[Schedule]) {
    request =>
      Try(UUID.fromString(request.headers("X-Access-Token"))) match {
        case Success(accessToken) =>
          events
            .rescheduleVeranstaltung(
              Id(event),
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

  def putEventLocation(event: Int) = Action.async(validateJson[Location]) {
    request =>
      Try(UUID.fromString(request.headers("X-Access-Token"))) match {
        case Success(accessToken) =>
          events
            .relocateVeranstaltung(
              Id(event),
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

  def patchEvent(event: Int) = Action.async(validateJson[Calibration]) {
    request =>
      Try(UUID.fromString(request.headers("X-Access-Token"))) match {
        case Success(accessToken) =>
          events
            .recalibrateVeranstaltung(
              Id(event),
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
}
