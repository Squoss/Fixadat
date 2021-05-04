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

package filters

import akka.stream.Materializer
import play.api.Configuration
import play.api.Logging
import play.api.i18n.I18nSupport
import play.api.i18n.Lang
import play.api.mvc.Cookie
import play.api.mvc.Filter
import play.api.mvc.RequestHeader
import play.api.mvc.Result
import play.api.routing.HandlerDef
import play.api.routing.Router

import javax.inject.Inject
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class MessagesFilter @Inject() (implicit
    val mat: Materializer,
    ec: ExecutionContext,
    config: Configuration
) extends Filter {

  def apply(
      nextFilter: RequestHeader => Future[Result]
  )(requestHeader: RequestHeader): Future[Result] = {

    // cannot use I18nSupport above (this is a filter, not a controller) and therefore not result.withLang below
    // https://www.playframework.com/documentation/latest/ScalaI18N#Language-Cookie-Support
    // for future reference: https://www.playframework.com/documentation/latest/api/scala/play/api/i18n/MessagesApi.html#setLang(result:play.api.mvc.Result,lang:play.api.i18n.Lang):play.api.mvc.Result
    val cookieName = config
      .getOptional[String]("play.i18n.langCookieName")
      .getOrElse("PLAY_LANG")
    val query = requestHeader.queryString
    val newLocale =
      query.get("locale").flatMap(_.headOption.flatMap(Lang.get(_)))
    if (newLocale.isEmpty) {
      nextFilter(requestHeader).map { result => result }
    } else {
      nextFilter(requestHeader.withTransientLang(newLocale.get)).map { result =>
        result.withCookies(Cookie(cookieName, newLocale.get.code))
      }
    }
  }
}
