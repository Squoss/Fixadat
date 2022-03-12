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

package domain.service_implementations

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.entity_implementations.Veranstaltung
import domain.entity_interfaces.GuestVeranstaltung
import domain.entity_interfaces.HostVeranstaltung
import domain.persistence.Repository
import domain.persistence.RsvpEvent
import domain.persistence.VeranstaltungPrivatizedEvent
import domain.persistence.VeranstaltungProtectedEvent
import domain.persistence.VeranstaltungPublishedEvent
import domain.persistence.VeranstaltungRecalibratedEvent
import domain.persistence.VeranstaltungRelocatedEvent
import domain.persistence.VeranstaltungRepublishedEvent
import domain.persistence.VeranstaltungRescheduledEvent
import domain.persistence.VeranstaltungRetextedEvent
import domain.service_interfaces.Veranstaltungen
import domain.value_objects.AccessToken
import domain.value_objects.Attendance._
import domain.value_objects.EmailAddress
import domain.value_objects.Error._
import domain.value_objects.Geo
import domain.value_objects.Id
import domain.value_objects.Visibility._
import thirdparty_apis.Email
import thirdparty_apis.Sms

import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.Locale
import java.util.TimeZone
import java.util.UUID
import javax.inject.Inject
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class VeranstaltungenService @Inject() (implicit
    ec: ExecutionContext,
    repository: Repository,
    email: Email,
    sms: Sms
) extends Veranstaltungen {

  override def publishVeranstaltung(): Future[(Id, AccessToken)] = {

    val id = Id((Math.random() * Int.MaxValue).toInt)
    val hostToken = AccessToken(UUID.randomUUID())
    repository
      .logEvent(
        VeranstaltungPublishedEvent(
          id,
          AccessToken(UUID.randomUUID()),
          hostToken,
          Instant.now()
        )
      )
      .flatMap(if (_) { // created
        Future((id, hostToken))
      } else { // not created
        publishVeranstaltung()
      })
  }

  private def readVeranstaltung(id: Id): Future[Option[Veranstaltung]] =
    repository
      .readEvents(id)
      .map(_ match {
        case (Some(snapshot), Nil) => Some(Veranstaltung(snapshot))
        case (Some(snapshot), eventsTail) => {
          val veranstaltung = Veranstaltung(snapshot).replay(eventsTail)
          repository.fastForwardSnapshot(veranstaltung) // fire & forget
          Some(veranstaltung)
        }
        case (None, Nil) => None
        case (None, events) => {
          val veranstaltung = Veranstaltung.replay(events)
          repository.fastForwardSnapshot(veranstaltung) // fire & forget
          Some(veranstaltung)
        }
      })

  override def readGuestVeranstaltung(
      id: Id,
      token: AccessToken,
      timeZone: Option[ZoneId]
  ): Future[Either[Error, GuestVeranstaltung]] =
    readVeranstaltung(id).map(
      _.map(Right(_))
        .getOrElse(Left(NotFound))
        .flatMap(veranstaltung =>
          if (
            token == veranstaltung.guestToken || token == veranstaltung.hostToken
          ) {
            if (veranstaltung.visibility != Private) {
              if (
                timeZone.isDefined && veranstaltung.dateTime.isDefined && veranstaltung.timeZone.isDefined
              ) {
                val zonedDateTime = ZonedDateTime.of(
                  veranstaltung.dateTime.get,
                  veranstaltung.timeZone.get.toZoneId
                )
                val localDateTime = zonedDateTime
                  .withZoneSameInstant(timeZone.get)
                  .toLocalDateTime
                Right(
                  veranstaltung.copy(
                    dateTime = Some(localDateTime),
                    timeZone = timeZone.map(TimeZone.getTimeZone(_))
                  )
                )
              } else {
                Right(veranstaltung)
              }
            } else {
              Left(PrivateAccess)
            }
          } else {
            Left(AccessDenied)
          }
        )
    )

  override def readHostVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, HostVeranstaltung]] =
    readVeranstaltung(id).map(
      _.map(Right(_))
        .getOrElse(Left(NotFound))
        .flatMap(veranstaltung =>
          if (token == veranstaltung.hostToken) {
            Right(veranstaltung)
          } else {
            Left(AccessDenied)
          }
        )
    )

  override def retextVeranstaltung(
      id: Id,
      token: AccessToken,
      name: String,
      description: Option[String]
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (
          veranstaltung.name == name && veranstaltung.description == description // neither trim nor filter out blank
        ) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungRetextedEvent(
              id,
              name,
              description,
              Instant.now()
            ) // neither trim nor filter out blank
          )
          Right(true)
        }
      )
  )

  override def rescheduleVeranstaltung(
      id: Id,
      token: AccessToken,
      dateTime: Option[LocalDateTime],
      timeZone: Option[TimeZone]
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (
          veranstaltung.dateTime == dateTime && veranstaltung.timeZone == timeZone
        ) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungRescheduledEvent(
              id,
              dateTime,
              timeZone,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def relocateVeranstaltung(
      id: Id,
      token: AccessToken,
      url: Option[URL],
      geo: Option[Geo]
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (veranstaltung.url == url && veranstaltung.geo == geo) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungRelocatedEvent(
              id,
              url,
              geo,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )
  override def recalibrateVeranstaltung(
      id: Id,
      token: AccessToken,
      emailAddressRequired: Option[Boolean],
      phoneNumberRequired: Option[Boolean],
      plus1Allowed: Option[Boolean]
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (
          emailAddressRequired.isEmpty && phoneNumberRequired.isEmpty && plus1Allowed.isEmpty
        ) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungRecalibratedEvent(
              id,
              emailAddressRequired
                .getOrElse(veranstaltung.emailAddressRequired),
              phoneNumberRequired.getOrElse(veranstaltung.phoneNumberRequired),
              plus1Allowed.getOrElse(veranstaltung.plus1Allowed),
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def protectVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (veranstaltung.visibility == Protected) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungProtectedEvent(
              id,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def privatizeVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (veranstaltung.visibility == Private) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungPrivatizedEvent(
              id,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def republishVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (veranstaltung.visibility == Public) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungRepublishedEvent(
              id,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def deleteVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Unit]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else {
          repository.deleteEvents(id)
          Right(())
        }
      )
  )

  override def rsvp(
      id: Id,
      token: AccessToken,
      locale: Locale,
      name: String,
      emailAddress: Option[EmailAddress],
      phoneNumber: Option[PhoneNumber],
      attendance: Attendance
  ): Future[Either[Error, Unit]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (
          veranstaltung.guestToken != token && veranstaltung.hostToken != token
        ) { Left(AccessDenied) }
        else if (veranstaltung.visibility == Private) {
          Left(PrivateAccess)
        } else if (veranstaltung.visibility == Protected) {
          Left(ProtectedAccess)
        } else if (
          veranstaltung.emailAddressRequired && emailAddress.isEmpty || veranstaltung.phoneNumberRequired && phoneNumber.isEmpty || !veranstaltung.plus1Allowed && attendance == WithPlus1
        ) {
          Left(CommandIncomplete)
        } else {
          repository.logEvent(
            RsvpEvent(
              id,
              name,
              emailAddress,
              phoneNumber,
              attendance,
              Instant.now()
            )
          )
          Right(())
        }
      )
  )

  override def sendLinksReminder(
      id: Id,
      token: AccessToken,
      locale: Locale,
      emailAddress: Option[EmailAddress],
      phoneNumber: Option[PhoneNumber]
  ): Future[Either[Error, Unit]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else {
          emailAddress.foreach(ea => email.send(ea, "TODO", "TODO"))
          phoneNumber.foreach(pn => sms.send(pn, "TODO"))
          Right(())
        }
      )
  )
}
