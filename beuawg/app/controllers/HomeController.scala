package controllers

import play.api.Environment
import play.api.i18n.I18nSupport
import play.api.i18n.Lang
import play.api.libs.json.Json
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
    val env: Environment
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

  def jsonMessages = Action { implicit request =>
    val lang = request.lang
    val default = messagesApi.messages.get("default").getOrElse(Map())
    val language =
      messagesApi.messages.get(Lang(lang.language).code).getOrElse(Map())
    val country = messagesApi.messages
      .get(Lang(lang.language, lang.country).code)
      .getOrElse(Map())
    val script = messagesApi.messages
      .get(Lang(lang.language, lang.country, lang.script).code)
      .getOrElse(Map())
    val variant = messagesApi.messages
      .get(Lang(lang.language, lang.country, lang.script, lang.variant).code)
      .getOrElse(Map())
    Ok(Json.toJson(default ++ language ++ country ++ script ++ variant))
  }
}
