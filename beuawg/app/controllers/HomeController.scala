package controllers

import jsmessages.JsMessagesFactory
import play.api.Environment
import play.api.i18n.I18nSupport
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request
import play.filters.csrf.CSRF

import javax.inject.Inject
import javax.inject.Singleton
import scala.io.Codec
import scala.io.Source

@Singleton
class HomeController @Inject() (
    val controllerComponents: ControllerComponents,
    val env: Environment,
    jsMessagesFactory: JsMessagesFactory
) extends BaseController
    with I18nSupport {

  val is = env.classLoader.getResourceAsStream("public/index.html")
  val bufferedSource = Source.createBufferedSource(
    inputStream = is,
    close = () => is.close()
  )(Codec.UTF8)
  val stringBuilder = bufferedSource.addString(new StringBuilder())
  val string = stringBuilder.mkString

  def index() = Action { implicit request: Request[AnyContent] =>
    val token =
      CSRF.getToken // // https://www.playframework.com/documentation/latest/ScalaCsrf#Getting-the-current-token
    Ok(string.replace("REPLACE_CSRF_TOKEN", token.get.value))
      .as("text/html")
  }

  def jsMessages = Action { implicit request =>
    Ok(jsMessagesFactory.all(Some("window.jsMessages")))
  }
}
