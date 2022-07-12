/*
 * The MIT License
 *
 * Copyright (c) 2021-2022 Squeng AG
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
import domain.entity_interfaces.ElectionT
import domain.value_objects.AccessToken
import domain.value_objects.Availability._
import domain.value_objects.EmailAddress
import domain.value_objects.Error._
import domain.value_objects.Id

import java.net.URL
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.Locale
import java.util.TimeZone
import scala.concurrent.Future

trait Elections {

  def publishElection(
  ): Future[(Id, AccessToken)]

  def readElection(
      id: Id,
      token: AccessToken,
      timeZone: Option[ZoneId]
  ): Future[Either[Error, ElectionT]]

  def retextElection(
      id: Id,
      token: AccessToken,
      name: String,
      description: Option[String]
  ): Future[Either[Error, Boolean]]

  def nominateCandidates(
      id: Id,
      token: AccessToken,
      timeZone: Option[TimeZone],
      candidates: Set[LocalDateTime]
  ): Future[Either[Error, Boolean]]

  def protectElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]]

  def privatizeElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]]

  def republishElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]]

  def deleteElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Unit]]

  def vote(
      id: Id,
      token: AccessToken,
      locale: Locale,
      name: String,
      timeZone: Option[TimeZone],
      availability: Map[LocalDateTime, Availability]
  ): Future[Either[Error, Unit]]

  def sendLinksReminder(
      id: Id,
      token: AccessToken,
      host: String,
      emailAddress: Option[EmailAddress],
      subject: String,
      plainText: String,
      phoneNumber: Option[PhoneNumber],
      text: String
  ): Future[Either[Error, Unit]]

  def subscribe(
      id: Id,
      token: AccessToken,
      locale: Locale,
      emailAddress: Option[EmailAddress],
      phoneNumber: Option[PhoneNumber],
      url: Option[URL]
  ): Future[Either[Error, Unit]]
}
