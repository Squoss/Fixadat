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
