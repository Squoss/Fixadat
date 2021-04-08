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

package ports

import java.net.URL
import java.time.LocalDate
import java.time.LocalTime
import java.util.TimeZone
import java.util.UUID

import scala.concurrent.Future

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import com.google.inject.ImplementedBy
import domain.VeranstaltungenService
import domain.entities.Veranstaltung
import domain.values.AccessToken
import domain.values.Attendance._
import domain.values.EmailAddress
import domain.values.Error._
import domain.values.Id
import domain.values.GuestVeranstaltung
import domain.values.HostVeranstaltung
import java.time.ZoneId

@ImplementedBy(classOf[VeranstaltungenService])
trait Veranstaltungen {

  def openVeranstaltung(): Future[(Id, AccessToken)]

  def readGuestVeranstaltung(
      id: Id,
      token: AccessToken,
      timeZone: Option[ZoneId]
  ): Future[Either[Error, GuestVeranstaltung]]

  def readHostVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, HostVeranstaltung]]

  def retextVeranstaltung(
      id: Id,
      token: AccessToken,
      name: String,
      description: Option[String]
  ): Future[Either[Error, Boolean]]

  def rescheduleVeranstaltung(
      id: Id,
      token: AccessToken,
      date: Option[LocalDate],
      time: Option[LocalTime],
      timeZone: Option[TimeZone]
  ): Future[Either[Error, Boolean]]

  def relocateVeranstaltung(
      id: Id,
      token: AccessToken,
      url: Option[URL],
      place: Option[String] // FIXME
  ): Future[Either[Error, Boolean]]

  def recalibrateVeranstaltung(
      id: Id,
      token: AccessToken,
      emailAddressRequired: Option[Boolean],
      phoneNumberRequired: Option[Boolean],
      plus1Allowed: Option[Boolean]
  ): Future[Either[Error, Boolean]]

  def closeVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]]

  def reopenVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]]

  def deleteVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Unit]]

  def rsvp(
      id: Id,
      token: AccessToken,
      name: String,
      emailAddress: Option[EmailAddress],
      phoneNumber: Option[PhoneNumber],
      attendance: Attendance
  ): Future[Either[Error, Unit]]
}
