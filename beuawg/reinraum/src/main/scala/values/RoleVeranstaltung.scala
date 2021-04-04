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

package domain.values

import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.TimeZone

import domain.values.Role._

sealed trait RoleVeranstaltung {

  val role: Role

  val id: Id

  val guestToken: AccessToken

  val name: String

  val description: Option[String]

  val date: Option[LocalDate]

  val time: Option[LocalTime]

  val timeZone: Option[TimeZone]

  val url: Option[URL]

  val place: Option[String] // FIXME

  val emailAddressRequired: Boolean

  val phoneNumberRequired: Boolean

  val plus1Allowed: Boolean
}

final case class GuestVeranstaltung(
    id: Id,
    guestToken: AccessToken,
    name: String,
    description: Option[String],
    date: Option[LocalDate],
    time: Option[LocalTime],
    timeZone: Option[TimeZone],
    url: Option[URL],
    place: Option[String], // FIXME
    emailAddressRequired: Boolean,
    phoneNumberRequired: Boolean,
    plus1Allowed: Boolean,
    role: Role = Guest
) extends RoleVeranstaltung

final case class HostVeranstaltung(
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
    place: Option[String], // FIXME
    emailAddressRequired: Boolean,
    phoneNumberRequired: Boolean,
    plus1Allowed: Boolean,
    rsvps: Seq[Rsvp],
    closed: Boolean,
    updated: Instant,
    role: Role = Host
) extends RoleVeranstaltung
