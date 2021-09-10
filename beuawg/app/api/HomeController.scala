/*
 * The MIT License
 *
 * Copyright (c) 2021 Squeng AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package api

import org.apache.commons.validator.routines.UrlValidator
import play.api.Configuration
import play.api.Environment
import play.api.i18n.I18nSupport
import play.api.i18n.Lang
import play.api.libs.json.Json
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request
import play.filters.csrf.CSRF

import java.util.TimeZone
import javax.inject.Inject
import javax.inject.Singleton
import scala.io.Codec
import scala.io.Source

@Singleton
class HomeController @Inject() (
    val config: Configuration,
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
  val string = stringBuilder.mkString.replace(
    "REPLACE_HERE_API_KEY",
    config.get[String]("here.api.key")
  )

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

  def timeZones = Action { implicit request =>
    val timeZones = TimeZone.getAvailableIDs
    Ok(Json.toJson(timeZones))
  }

  val schemes = Array("http", "https")
  val urlValidator = new UrlValidator(schemes)

  def validate(url: String) = Action { implicit request =>
    Ok(
      Json.obj(
        "URL" -> url,
        "valid" -> urlValidator.isValid(url)
      )
    )
  }
}
