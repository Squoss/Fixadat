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

package controllers

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.values.AccessToken
import domain.values.Attendance._
import domain.values.EmailAddress
import domain.values.GuestVeranstaltung
import domain.values.HostVeranstaltung
import domain.values.Id
import domain.values.Rsvp
import domain.values.Visibility._
import play.api.libs.json._

import java.net.URL
import java.time.LocalDate
import java.time.LocalTime
import java.util.TimeZone
import java.util.UUID
import scala.util.Failure
import scala.util.Success
import scala.util.Try

case class P(visibility: Visibility)
case class Text(name: String, description: Option[String])
case class Schedule(
    date: Option[LocalDate],
    time: Option[LocalTime],
    timeZone: Option[TimeZone]
)
case class Location(url: Option[URL], place: Option[String]) // FIXME
case class Calibration(
    emailAddressRequired: Option[Boolean],
    phoneNumberRequired: Option[Boolean],
    plus1Allowed: Option[Boolean]
)

object TransferObjects {

  implicit val idReads = new Reads[Id] {
    def reads(json: JsValue): JsResult[Id] = Try(Id(json.as[Int])) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val idWrites = new Writes[Id] {
    def writes(id: Id): JsValue = JsNumber(id.wert)
  }
  implicit val idFormat: Format[Id] = Format(idReads, idWrites)

  implicit val atReads = new Reads[AccessToken] {
    def reads(json: JsValue): JsResult[AccessToken] = Try(
      AccessToken(UUID.fromString(json.as[String]))
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val atWrites = new Writes[AccessToken] {
    def writes(at: AccessToken): JsValue = JsString(at.wert.toString)
  }
  implicit val atFormat: Format[AccessToken] = Format(atReads, atWrites)

  implicit val tzReads = new Reads[TimeZone] {
    def reads(json: JsValue): JsResult[TimeZone] = Try(
      TimeZone.getTimeZone(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val tzWrites = new Writes[TimeZone] {
    def writes(tz: TimeZone): JsValue = JsString(tz.getID)
  }
  implicit val tzFormat: Format[TimeZone] = Format(tzReads, tzWrites)

  implicit val urlReads = new Reads[URL] {
    def reads(json: JsValue): JsResult[URL] = Try(
      new URL(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val urlWrites = new Writes[URL] {
    def writes(url: URL): JsValue = JsString(url.toString)
  }
  implicit val urlFormat: Format[URL] = Format(urlReads, urlWrites)

  implicit val veReads = new Reads[Visibility] {
    def reads(json: JsValue): JsResult[Visibility] = Try(
      domain.values.Visibility.withName(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val veWrites = new Writes[Visibility] {
    def writes(ve: Visibility): JsValue = JsString(
      ve.toString
    )
  }
  implicit val veFormat: Format[Visibility] =
    Format(veReads, veWrites)

  implicit val guestVeranstaltungReads = Json.reads[GuestVeranstaltung]
  implicit val guestVeranstaltunglWrites = Json.writes[GuestVeranstaltung]
  implicit val guestVeranstaltungFormat = Json.format[GuestVeranstaltung]

  implicit val eaReads = new Reads[EmailAddress] {
    def reads(json: JsValue): JsResult[EmailAddress] = Try(
      EmailAddress(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val eaWrites = new Writes[EmailAddress] {
    def writes(ea: EmailAddress): JsValue = JsString(ea.wert)
  }
  implicit val eaFormat: Format[EmailAddress] = Format(eaReads, eaWrites)

  implicit val pnReads = new Reads[PhoneNumber] {
    def reads(json: JsValue): JsResult[PhoneNumber] = Try(
      PhoneNumberUtil.getInstance().parse(json.as[String], "CH")
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val pnWrites = new Writes[PhoneNumber] {
    def writes(pn: PhoneNumber): JsValue = JsString(
      PhoneNumberUtil.getInstance().format(pn, PhoneNumberFormat.E164)
    )
  }
  implicit val pnFormat: Format[PhoneNumber] = Format(pnReads, pnWrites)

  implicit val aeReads = new Reads[Attendance] {
    def reads(json: JsValue): JsResult[Attendance] = Try(
      domain.values.Attendance.withName(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val aeWrites = new Writes[Attendance] {
    def writes(ae: Attendance): JsValue = JsString(
      ae.toString
    )
  }
  implicit val aeFormat: Format[Attendance] =
    Format(aeReads, aeWrites)

  implicit val rsvpVeranstaltungReads = Json.reads[Rsvp]
  implicit val rsvpVeranstaltunglWrites = Json.writes[Rsvp]
  implicit val rsvpVeranstaltungFormat = Json.format[Rsvp]

  implicit val hostVeranstaltungReads = Json.reads[HostVeranstaltung]
  implicit val hostVeranstaltunglWrites = Json.writes[HostVeranstaltung]
  implicit val hostVeranstaltungFormat = Json.format[HostVeranstaltung]

  implicit val pReads = Json.reads[P]
  implicit val textReads = Json.reads[Text]
  implicit val scheduleReads = Json.reads[Schedule]
  implicit val locationReads = Json.reads[Location]
  implicit val calibrationReads = Json.reads[Calibration]
}
