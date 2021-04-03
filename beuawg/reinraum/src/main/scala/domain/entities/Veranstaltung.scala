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

import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.TimeZone

import scala.collection.mutable

import domain.RsvpEvent
import domain.VeranstaltungClosedEvent
import domain.VeranstaltungEvent
import domain.VeranstaltungOpenedEvent
import domain.VeranstaltungRecalibratedEvent
import domain.VeranstaltungRelocatedEvent
import domain.VeranstaltungReopenedEvent
import domain.VeranstaltungRescheduledEvent
import domain.VeranstaltungRetextedEvent
import domain.values.AccessToken
import domain.values.Error._
import domain.values.GuestVeranstaltung
import domain.values.HostVeranstaltung
import domain.values.Id
import domain.values.RoleVeranstaltung
import domain.values.Rsvp

final class Veranstaltung private (
    val id: Id,
    val created: Instant,
    val guestToken: AccessToken,
    val hostToken: AccessToken,
    var name: String,
    var description: Option[String],
    var date: Option[LocalDate],
    var time: Option[LocalTime],
    var timeZone: Option[TimeZone],
    var url: Option[URL],
    var place: Option[String],
    var emailAddressRequired: Boolean,
    var phoneNumberRequired: Boolean,
    var plus1Allowed: Boolean,
    var closed: Boolean,
    val rsvps: mutable.Buffer[Rsvp],
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
      assert(this.id == id)
      event match {
        case VeranstaltungOpenedEvent(_, _, _, _) => assert(false)
        case VeranstaltungRetextedEvent(_, name, description, _) =>
          this.name = name; this.description = description
        case VeranstaltungRescheduledEvent(
              _,
              date,
              time,
              timeZone,
              _
            ) =>
          this.date = date; this.time = time; this.timeZone = timeZone
        case VeranstaltungRelocatedEvent(_, url, place, _) =>
          this.url = url; this.place = place
        case VeranstaltungRecalibratedEvent(
              _,
              emailAddressRequired,
              phoneNumberRequired,
              plus1Allowed,
              _
            ) =>
          this.emailAddressRequired = emailAddressRequired;
          this.phoneNumberRequired = phoneNumberRequired;
          this.plus1Allowed = plus1Allowed
        case VeranstaltungClosedEvent(_, _)   => closed = true
        case VeranstaltungReopenedEvent(_, _) => closed = false
        case RsvpEvent(
              _,
              name,
              emailAddress,
              phoneNumber,
              attendance,
              _
            ) =>
          rsvps += Rsvp(name, emailAddress, phoneNumber, attendance)
      }
      updated = event.occurred
      replayedEvents += 1
    })
    this
  }

  def isClosed() = closed

  private def toGuestVeranstaltung(): GuestVeranstaltung = GuestVeranstaltung(
    id,
    guestToken,
    name,
    description,
    date,
    time,
    timeZone,
    url,
    place,
    emailAddressRequired,
    phoneNumberRequired,
    plus1Allowed
  )

  private def toHostVeranstaltung(): HostVeranstaltung = HostVeranstaltung(
    id,
    created,
    guestToken,
    hostToken,
    name,
    description,
    date,
    time,
    timeZone,
    url,
    place,
    emailAddressRequired,
    phoneNumberRequired,
    plus1Allowed,
    rsvps.toSeq,
    closed,
    updated
  )

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
      date: Option[LocalDate],
      time: Option[LocalTime],
      timeZone: Option[TimeZone],
      url: Option[URL],
      place: Option[String],
      emailAddressRequired: Boolean,
      phoneNumberRequired: Boolean,
      plus1Allowed: Boolean,
      rsvps: Seq[Rsvp],
      closed: Boolean,
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
      date,
      time,
      timeZone,
      url,
      place,
      emailAddressRequired,
      phoneNumberRequired,
      plus1Allowed,
      closed,
      rsvps.toBuffer,
      updated,
      replayedEvents
    )

  def replay(events: Seq[VeranstaltungEvent]): Veranstaltung =
    events match {
      case VeranstaltungOpenedEvent(
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
          None,
          None,
          None,
          None,
          None,
          false,
          false,
          false,
          Nil,
          false,
          occurred,
          1
        )
          .replay(eventsTail)
    }
}
