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

package domain.entities

import java.time.Instant

import domain.VeranstaltungCreatedEvent
import domain.VeranstaltungDeletedEvent
import domain.VeranstaltungEvent
import domain.VeranstaltungRetextedEvent
import domain.values.AccessToken
import domain.values.Error._
import domain.values.GuestVeranstaltung
import domain.values.HostVeranstaltung
import domain.values.Id
import domain.values.RoleVeranstaltung

final class Veranstaltung(
    val id: Id,
    val created: Instant,
    val guestToken: AccessToken,
    val hostToken: AccessToken,
    var name: String,
    var description: Option[String],
    var deleted: Boolean,
    var updated: Instant,
    var replayedEvents: Int
) {

  override def equals(that: Any) = that match {
    case v: Veranstaltung => this.id == v.id
    case _                => false
  }

  override val hashCode = id.##

  def replay(events: Seq[VeranstaltungEvent]): Veranstaltung = {
    events.foreach(event => {
      event match {
        case VeranstaltungRetextedEvent(_, name, description, _) =>
          this.name = name; this.description = description
        // TODO
        case VeranstaltungDeletedEvent(_, _) => deleted = true
      }
      updated = event.occurred
      replayedEvents += 1
    })
    this
  }

  def isDeleted() = deleted

  private def toGuestVeranstaltung(): GuestVeranstaltung = ???

  private def toHostVeranstaltung(): HostVeranstaltung = ???

  def toRoleVeranstaltung(
      token: AccessToken
  ): Either[Error, RoleVeranstaltung] =
    token match {
      case _ if token == guestToken => Right(toGuestVeranstaltung)
      case _ if token == hostToken  => Right(toHostVeranstaltung)
      case _                        => Left(AccessDenied)
    }
}

object Veranstaltung {
  def apply(
      id: Id,
      created: Instant,
      guestToken: AccessToken,
      hostToken: AccessToken,
      name: String,
      description: Option[String],
      deleted: Boolean,
      updated: Instant,
      replayedEvents: Int
  ) =
    new Veranstaltung(
      id,
      created,
      guestToken,
      hostToken,
      name,
      description,
      deleted,
      updated,
      replayedEvents
    )

  def replay(events: Seq[VeranstaltungEvent]): Veranstaltung =
    events match {
      case VeranstaltungCreatedEvent(
            id,
            guestToken,
            hostToken,
            occurred
          ) :: eventsTail =>
        Veranstaltung(
          id,
          occurred,
          guestToken,
          hostToken,
          id.toString,
          None,
          false,
          occurred,
          1
        )
          .replay(eventsTail)
    }
}
