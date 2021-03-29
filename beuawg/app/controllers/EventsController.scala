package controllers

import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

import play.api.Environment
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request

@Singleton
class EventsController @Inject() (
    val controllerComponents: ControllerComponents,
    val env: Environment
) extends BaseController {

  def prettyToDo(event: String) = TODO

  def todo(event: UUID) = TODO
}
