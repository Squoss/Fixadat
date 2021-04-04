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
import play.api.libs.json.JsObject
import play.api.libs.json.Json
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

  private def toResponse(error: Error): Status = error match {
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
              toResponse(_),
              rv =>
                rv match {
                  case gv: GuestVeranstaltung => Ok(Json.toJson(gv))
                  case hv: HostVeranstaltung  => Ok(Json.toJson(hv))
                }
            )
          )
      case Failure(exception) => Future(BadRequest(exception.getMessage))
    }
  }
}
