/*
 * The MIT License
 *
 * Copyright (c) 2021-2026 Squeng AG
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

package gui

import domain.driving_ports.Elections
import domain.value_objects.AccessToken
import domain.value_objects.ElectionSnapshot
import domain.value_objects.Error
import domain.value_objects.Error.*
import domain.value_objects.Id
import domain.value_objects.Vote
import play.api.i18n.I18nSupport
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request

import java.time.LocalDateTime
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success
import scala.util.Try

@Singleton
class TwirlController @Inject() (implicit
    ec: ExecutionContext,
    val controllerComponents: ControllerComponents,
    val elections: Elections
) extends BaseController
    with I18nSupport {

  def hello() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.hello())
  }

  private def toErrorResponse(error: Error): Status = error match {
    case domain.value_objects.Error.NotFound => NotFound
    case AccessDenied                        => Forbidden
    case PrivateAccess                       => Gone
    case ProtectedAccess                     => Conflict
    case CommandIncomplete                   => BadRequest
  }

  private def toPopularity(
      votes: Seq[Vote]
  ): Map[LocalDateTime, (Int, Int, Int)] =
    votes
      .flatMap(_.availability.toSeq)
      .groupBy { entry => entry._1 }
      .map { case (candidate, availabilities) =>
        candidate -> (
          availabilities.count { case (_, availability) =>
            availability == domain.value_objects.Availability.Yes
          },
          availabilities.count { case (_, availability) =>
            availability == domain.value_objects.Availability.IfNeedBe
          },
          availabilities.count { case (_, availability) =>
            availability == domain.value_objects.Availability.No
          }
        )
      }

  def getElection(id: Id, accessToken: AccessToken, timeZone: Option[String]) =
    Action.async { implicit request =>
      Try(timeZone.map(ZoneId.of(_))) match { // TimeZone.getTimeZone(_) would resort to GMT in case of an unknown time zone
        case Success(zoneId) =>
          elections
            .readElection(
              id,
              accessToken,
              zoneId
            )
            .map(
              _.fold(
                toErrorResponse(_),
                election =>
                  Ok(
                    views.html.without(
                      accessToken,
                      election,
                      toPopularity(election.votes)
                    )
                  )
              )
            )
        case Failure(exception) =>
          Future(BadRequest(exception.getMessage))
      }
    }
}
