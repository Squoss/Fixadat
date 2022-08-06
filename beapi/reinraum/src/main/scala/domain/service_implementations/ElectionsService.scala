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
import domain.entity_implementations.Election
import domain.entity_interfaces.ElectionT
import domain.persistence.CandidatesNominatedEvent
import domain.persistence.PrivatizedEvent
import domain.persistence.ProtectedEvent
import domain.persistence.PublishedEvent
import domain.persistence.Repository
import domain.persistence.RepublishedEvent
import domain.persistence.RetextedEvent
import domain.persistence.SubscribedEvent
import domain.persistence.VoteDeletedEvent
import domain.persistence.VotedEvent
import domain.service_interfaces.Elections
import domain.value_objects.AccessToken
import domain.value_objects.Availability._
import domain.value_objects.EmailAddress
import domain.value_objects.Error._
import domain.value_objects.Id
import domain.value_objects.Visibility._
import domain.value_objects.Vote
import thirdparty_apis.Email
import thirdparty_apis.Sms

import java.net.URL
import java.text.MessageFormat
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

class ElectionsService @Inject() (implicit
    ec: ExecutionContext,
    repository: Repository,
    email: Email,
    sms: Sms
) extends Elections {

  val canaryToken = AccessToken(new UUID(0, 0))

  override def publishElection(
  ): Future[(Id, AccessToken)] = {

    val id = Id((Math.random() * Int.MaxValue).toInt)
    val organizerToken = AccessToken(UUID.randomUUID())
    repository
      .logEvent(
        PublishedEvent(
          id,
          organizerToken,
          AccessToken(UUID.randomUUID()),
          Instant.now()
        )
      )
      .flatMap(if (_) { // created
        Future((id, organizerToken))
      } else { // not created
        publishElection()
      })
  }

  private def readElection(id: Id): Future[Option[Election]] =
    repository
      .readEvents(id)
      .map(_ match {
        case (Some(snapshot), Nil) => Some(Election(snapshot))
        case (Some(snapshot), eventsTail) => {
          val election = Election(snapshot).replay(eventsTail)
          repository.fastForwardSnapshot(election) // fire & forget
          Some(election)
        }
        case (None, Nil) => None
        case (None, events) => {
          val election = Election.replay(events)
          repository.fastForwardSnapshot(election) // fire & forget
          Some(election)
        }
      })

  override def readElection(
      id: Id,
      token: AccessToken,
      zoneId: Option[ZoneId]
  ): Future[Either[Error, Election]] =
    readElection(id).map(
      _.map(Right(_))
        .getOrElse(Left(NotFound))
        .flatMap(election =>
          if (
            token == election.voterToken || token == election.organizerToken
          ) {
            if (election.visibility != Private) {
              var e = if (token == election.organizerToken) { election }
              else {
                election.copy(
                  organizerToken = canaryToken,
                  subscriptions = (Locale.getDefault, None, None, None)
                )
              }
              if (zoneId.isDefined) {
                e = e.copy(
                  timeZone = zoneId.map(TimeZone.getTimeZone(_)),
                  candidates = e.candidates.map(ldt =>
                    ZonedDateTime
                      .of(
                        ldt,
                        e.timeZone.getOrElse(TimeZone.getDefault).toZoneId
                      )
                      .withZoneSameInstant(zoneId.get)
                      .toLocalDateTime
                  ),
                  votes = e.votes.map(vote =>
                    Vote(
                      vote.name,
                      vote.availability.map(_ match {
                        case (ldt, a) =>
                          (
                            ZonedDateTime
                              .of(
                                ldt,
                                e.timeZone
                                  .getOrElse(TimeZone.getDefault)
                                  .toZoneId
                              )
                              .withZoneSameInstant(zoneId.get)
                              .toLocalDateTime,
                            a
                          )
                      }),
                      vote.voted
                    )
                  )
                )
              }
              Right(e)
            } else {
              Left(PrivateAccess)
            }
          } else {
            Left(AccessDenied)
          }
        )
    )

  override def retextElection(
      id: Id,
      token: AccessToken,
      name: String,
      description: Option[String]
  ): Future[Either[Error, Boolean]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else if (
          election.name == name && election.description == description // neither trim nor filter out blank
        ) {
          Right(false)
        } else {
          repository.logEvent(
            RetextedEvent(
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

  override def nominateCandidates(
      id: Id,
      token: AccessToken,
      timeZone: Option[TimeZone],
      candidates: Set[LocalDateTime]
  ): Future[Either[Error, Boolean]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else if (
          election.timeZone == timeZone && election.candidates == candidates
        ) {
          Right(false)
        } else {
          repository.logEvent(
            CandidatesNominatedEvent(
              id,
              timeZone,
              candidates,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def protectElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else if (election.visibility == Protected) {
          Right(false)
        } else {
          repository.logEvent(
            ProtectedEvent(
              id,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def privatizeElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else if (election.visibility == Private) {
          Right(false)
        } else {
          repository.logEvent(
            PrivatizedEvent(
              id,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def republishElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Boolean]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else if (election.visibility == Public) {
          Right(false)
        } else {
          repository.logEvent(
            RepublishedEvent(
              id,
              Instant.now()
            )
          )
          Right(true)
        }
      )
  )

  override def deleteElection(
      id: Id,
      token: AccessToken
  ): Future[Either[Error, Unit]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else {
          repository.deleteEvents(id)
          Right(())
        }
      )
  )

  override def vote(
      id: Id,
      token: AccessToken,
      locale: Locale,
      name: String,
      timeZone: Option[TimeZone],
      availability: Map[LocalDateTime, Availability]
  ): Future[Either[Error, Unit]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (election.voterToken != token && election.organizerToken != token) {
          Left(AccessDenied)
        } else if (election.visibility == Private) {
          Left(PrivateAccess)
        } else if (election.visibility == Protected) {
          Left(ProtectedAccess)
        } else {
          repository.logEvent(
            VotedEvent(
              id,
              name,
              timeZone,
              availability,
              Instant.now()
            )
          )
          Right(())
        }
      )
  )
  override def deleteVote(
      id: Id,
      token: AccessToken,
      name: String,
      voted: Instant
  ): Future[Either[Error, Unit]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (election.voterToken != token && election.organizerToken != token) {
          Left(AccessDenied)
        } else if (election.visibility == Private) {
          Left(PrivateAccess)
        } else if (election.visibility == Protected) {
          Left(ProtectedAccess)
        } else {
          repository.logEvent(
            VoteDeletedEvent(
              id,
              name,
              voted,
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
      host: String,
      emailAddress: Option[EmailAddress],
      subject: String,
      plainText: String,
      phoneNumber: Option[PhoneNumber],
      text: String
  ): Future[Either[Error, Unit]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else {
          emailAddress.foreach(ea =>
            email.send(
              ea,
              MessageFormat.format(subject, election.name),
              MessageFormat.format(
                plainText,
                election.name,
                s"https://${host}/elections/${election.id.wert}#${election.organizerToken.wert}"
              )
            )
          )
          phoneNumber.foreach(pn =>
            sms.send(
              pn,
              MessageFormat.format(
                text,
                election.name,
                s"https://${host}/elections/${election.id.wert}#${election.organizerToken.wert}"
              )
            )
          )
          Right(())
        }
      )
  )

  override def subscribe(
      id: Id,
      token: AccessToken,
      locale: Locale,
      emailAddress: Option[EmailAddress],
      phoneNumber: Option[PhoneNumber],
      url: Option[URL]
  ): Future[Either[Error, Unit]] = readElection(id).map(
    _.map(Right(_))
      .getOrElse(Left(NotFound))
      .flatMap(election =>
        if (token != election.organizerToken) {
          Left(AccessDenied)
        } else {
          repository.logEvent(
            SubscribedEvent(
              id,
              locale,
              emailAddress,
              phoneNumber,
              url,
              Instant.now()
            )
          )
          Right(())
        }
      )
  )
}
