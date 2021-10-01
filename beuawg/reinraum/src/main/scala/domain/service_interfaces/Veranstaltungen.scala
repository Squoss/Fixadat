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

package domain.service_interfaces

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.entity_interfaces.GuestVeranstaltung
import domain.entity_interfaces.HostVeranstaltung
import domain.value_objects.AccessToken
import domain.value_objects.Attendance._
import domain.value_objects.EmailAddress
import domain.value_objects.Error._
import domain.value_objects.Geo
import domain.value_objects.Id

import java.net.URL
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.util.Locale
import java.util.TimeZone
import scala.concurrent.Future

trait Veranstaltungen {

  def publishVeranstaltung(): Future[(Id, AccessToken)]

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
      geo: Option[Geo]
  ): Future[Either[Error, Boolean]]

  def recalibrateVeranstaltung(
      id: Id,
      token: AccessToken,
      emailAddressRequired: Option[Boolean],
      phoneNumberRequired: Option[Boolean],
      plus1Allowed: Option[Boolean]
  ): Future[Either[Error, Boolean]]

  def protectVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]]

  def privatizeVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]]

  def republishVeranstaltung(
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
      locale: Locale,
      name: String,
      emailAddress: Option[EmailAddress],
      phoneNumber: Option[PhoneNumber],
      attendance: Attendance
  ): Future[Either[Error, Unit]]

  def sendLinksReminder(
      id: Id,
      token: AccessToken,
      locale: Locale,
      emailAddress: Option[EmailAddress],
      phoneNumber: Option[PhoneNumber]
  ): Future[Either[Error, Unit]]
}
