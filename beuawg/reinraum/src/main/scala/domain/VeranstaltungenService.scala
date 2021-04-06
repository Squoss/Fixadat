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

package domain

import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.TimeZone
import java.util.UUID
import javax.inject.Inject

import scala.concurrent.ExecutionContext
import scala.concurrent.Future

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.entities.Veranstaltung
import domain.values.AccessToken
import domain.values.Attendance._
import domain.values.EmailAddress
import domain.values.Error._
import domain.values.Id
import domain.values.RoleVeranstaltung
import domain.values.Visibility._
import ports.Notifications
import ports.Repository
import ports.Veranstaltungen

class VeranstaltungenService @Inject() (implicit
    ec: ExecutionContext,
    repository: Repository,
    notifications: Notifications
) extends Veranstaltungen {

  override def openVeranstaltung(): Future[(Id, AccessToken)] = {

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
        openVeranstaltung()
      })
  }

  private def readVeranstaltung(id: Id): Future[Option[Veranstaltung]] =
    repository
      .readEvents(id)
      .map(_ match {
        case (Some(snapshot), Nil) => Some(snapshot)
        case (Some(snapshot), eventsTail) => {
          val veranstaltung = snapshot.replay(eventsTail)
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

  override def readVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, RoleVeranstaltung]] =
    readVeranstaltung(id).map(
      _.map(Right(_))
        .getOrElse(Left(NotFound))
        .flatMap(_.toRoleVeranstaltung(token))
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
      date: Option[LocalDate],
      time: Option[LocalTime],
      timeZone: Option[TimeZone]
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (
          veranstaltung.date == date && veranstaltung.time == time && veranstaltung.timeZone == timeZone
        ) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungRescheduledEvent(
              id,
              date,
              time,
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
      place: Option[String] // FIXME
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (veranstaltung.url == url && veranstaltung.place == place) {
          Right(false)
        } else {
          repository.logEvent(
            VeranstaltungRelocatedEvent(
              id,
              url,
              place,
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

  override def closeVeranstaltung(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (veranstaltung.visibility != Public) {
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

  override def reopenVeranstaltung(
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
      token: AccessToken,
      forGood: Boolean
  ): Future[Either[Error, Unit]] = readVeranstaltung(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(veranstaltung =>
        if (veranstaltung.hostToken != token) { Left(AccessDenied) }
        else if (forGood) {
          repository.deleteEvents(id)
          Right(())
        } else {
          repository.logEvent(
            VeranstaltungDeletedEvent(
              id,
              Instant.now()
            )
          )
          Right(())
        }
      )
  )

  override def rsvp(
      id: Id,
      token: AccessToken,
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
          Left(Gone)
        } else if (
          veranstaltung.visibility == Protected ||
          veranstaltung.emailAddressRequired && emailAddress.isEmpty || veranstaltung.phoneNumberRequired && phoneNumber.isEmpty || !veranstaltung.plus1Allowed && attendance == WithPlus1
        ) {
          Left(BadCommand)
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
          veranstaltung.webhook
            .foreach(notifications.notifyByWebhook(_, "TODO")) // fire & forget
          Right(())
        }
      )
  )
}
