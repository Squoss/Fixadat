package controllers

import javax.inject.Inject
import javax.inject.Singleton

import play.api.Environment
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request

@Singleton
class HomeController @Inject() (
    val controllerComponents: ControllerComponents,
    val env: Environment
) extends BaseController {

  def index() = Action { implicit request: Request[AnyContent] =>
    implicit val ec = scala.concurrent.ExecutionContext.global
    Ok.sendResource("public/index.html", env.classLoader)
  }
}
