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

import domain.event_sourcing.RsvpEvent
import domain.event_sourcing.VeranstaltungEvent
import domain.event_sourcing.VeranstaltungPrivatizedEvent
import domain.event_sourcing.VeranstaltungProtectedEvent
import domain.event_sourcing.VeranstaltungPublishedEvent
import domain.event_sourcing.VeranstaltungRecalibratedEvent
import domain.event_sourcing.VeranstaltungRelocatedEvent
import domain.event_sourcing.VeranstaltungRepublishedEvent
import domain.event_sourcing.VeranstaltungRescheduledEvent
import domain.event_sourcing.VeranstaltungRetextedEvent
import domain.value_objects.AccessToken
import domain.value_objects.Error._
import domain.value_objects.Geo
import domain.value_objects.Id
import domain.value_objects.Rsvp
import domain.value_objects.Visibility._

import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.TimeZone
import scala.collection.mutable

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
    var geo: Option[Geo],
    var emailAddressRequired: Boolean,
    var phoneNumberRequired: Boolean,
    var plus1Allowed: Boolean,
    var visibility: Visibility,
    val rsvps: mutable.Buffer[Rsvp],
    var webhook: Option[URL],
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
        case VeranstaltungPublishedEvent(_, _, _, _) => assert(false)
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
        case VeranstaltungRelocatedEvent(_, url, geo, _) =>
          this.url = url; this.geo = geo
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
        case VeranstaltungProtectedEvent(_, _)   => visibility = Protected
        case VeranstaltungPrivatizedEvent(_, _)  => visibility = Private
        case VeranstaltungRepublishedEvent(_, _) => visibility = Public
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
      geo: Option[Geo],
      emailAddressRequired: Boolean,
      phoneNumberRequired: Boolean,
      plus1Allowed: Boolean,
      visibility: Visibility,
      rsvps: Seq[Rsvp],
      webhook: Option[URL],
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
      geo,
      emailAddressRequired,
      phoneNumberRequired,
      plus1Allowed,
      visibility,
      rsvps.toBuffer,
      webhook,
      updated,
      replayedEvents
    )

  def replay(events: Seq[VeranstaltungEvent]): Veranstaltung =
    events match {
      case VeranstaltungPublishedEvent(
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
          Public,
          Nil,
          None,
          occurred,
          1
        )
          .replay(eventsTail)
    }
}
