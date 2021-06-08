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

package domain.event_sourcing

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.value_objects.AccessToken
import domain.value_objects.Attendance._
import domain.value_objects.EmailAddress
import domain.value_objects.Geo
import domain.value_objects.Id

import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.TimeZone

sealed trait VeranstaltungEvent {

  def id: Id
  def occurred: Instant
  def version: Int
}

final case class VeranstaltungPublishedEvent(
    id: Id,
    guestToken: AccessToken,
    hostToken: AccessToken,
    occurred: Instant
) extends VeranstaltungEvent {

  val version = 1
}

final case class VeranstaltungRetextedEvent(
    id: Id,
    name: String,
    description: Option[String],
    occurred: Instant
) extends VeranstaltungEvent {

  val version = 1
}

final case class VeranstaltungRescheduledEvent(
    id: Id,
    date: Option[LocalDate],
    time: Option[LocalTime],
    timeZone: Option[TimeZone],
    occurred: Instant
) extends VeranstaltungEvent {

  val version = 1
}

final case class VeranstaltungRelocatedEvent(
    id: Id,
    url: Option[URL],
    geo: Option[Geo],
    occurred: Instant
) extends VeranstaltungEvent {

  val version = 1
}

final case class VeranstaltungRecalibratedEvent(
    id: Id,
    emailAddressRequired: Boolean,
    phoneNumberRequired: Boolean,
    plus1Allowed: Boolean,
    occurred: Instant
) extends VeranstaltungEvent {

  val version = 1
}

final case class VeranstaltungProtectedEvent(id: Id, occurred: Instant)
    extends VeranstaltungEvent {

  val version = 1
}

final case class VeranstaltungPrivatizedEvent(id: Id, occurred: Instant)
    extends VeranstaltungEvent {

  val version = 1
}

final case class VeranstaltungRepublishedEvent(id: Id, occurred: Instant)
    extends VeranstaltungEvent {

  val version = 1
}

final case class RsvpEvent(
    id: Id,
    name: String,
    emailAddress: Option[EmailAddress],
    phoneNumber: Option[PhoneNumber],
    attendance: Attendance,
    occurred: Instant
) extends VeranstaltungEvent {

  val version = 1
}
