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

package domain

import java.time.Instant
import java.util.UUID
import javax.inject.Inject

import scala.concurrent.ExecutionContext
import scala.concurrent.Future

import domain.entities.Veranstaltung
import domain.values.AccessToken
import domain.values.Error._
import domain.values.RoleVeranstaltung
import ports.Repository
import ports.Veranstaltungen
import domain.values.Id

class VeranstaltungenService @Inject() (implicit
    ec: ExecutionContext,
    repository: Repository
) extends Veranstaltungen {

  override def createVeranstaltung(): Future[(Id, AccessToken)] = {

    val id = Id((Math.random()*Int.MaxValue).toInt)
    val hostToken = AccessToken(UUID.randomUUID())
    repository
      .logEvent(
        VeranstaltungCreatedEvent(
          id,
          AccessToken(UUID.randomUUID()),
          hostToken,
          Instant.now()
        )
      )
      .flatMap(if (_) { // created
        Future((id, hostToken))
      } else { // not created
        createVeranstaltung()
      })
  }

  override def readVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, RoleVeranstaltung]] =
    repository
      .readEvents(id)
      .map(_ match {
        case (Some(snapshot), eventsTail) =>
          Right(snapshot.replay(eventsTail))
        case (None, Nil) => Left(NotFound)
        case (None, events) =>
          Right(Veranstaltung.replay(events))
      })
      .map(
        _.flatMap(veranstaltung =>
          if (veranstaltung.isDeleted) { Left(Gone) }
          else { veranstaltung.toRoleVeranstaltung(token) }
        )
      )
}
