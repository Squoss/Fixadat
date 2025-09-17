/*
 * The MIT License
 *
 * Copyright (c) 2021-2025 Squeng AG
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

package domain.entity_implementations

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.entity_interfaces.ElectionT
import domain.driven_ports.persistence.CandidatesNominatedEvent
import domain.driven_ports.persistence.ElectionEvent
import domain.driven_ports.persistence.PrivatizedEvent
import domain.driven_ports.persistence.ProtectedEvent
import domain.driven_ports.persistence.PublishedEvent
import domain.driven_ports.persistence.RepublishedEvent
import domain.driven_ports.persistence.RetextedEvent
import domain.driven_ports.persistence.SubscribedEvent
import domain.driven_ports.persistence.VoteDeletedEvent
import domain.driven_ports.persistence.VotedEvent
import domain.value_objects.AccessToken
import domain.value_objects.EmailAddress
import domain.value_objects.Error
import domain.value_objects.Error.*
import domain.value_objects.Id
import domain.value_objects.Visibility
import domain.value_objects.Visibility.*
import domain.value_objects.Vote

import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.util.Locale
import java.util.TimeZone
import scala.collection.mutable

final class Election private (
    val id: Id,
    val created: Instant,
    var updated: Instant,
    val organizerToken: AccessToken,
    val voterToken: AccessToken,
    var visibility: Visibility,
    var name: String,
    var description: Option[String],
    var timeZone: Option[TimeZone],
    var candidates: Set[LocalDateTime],
    private val _votes: mutable.Buffer[Vote],
    var subscriptions: (
        Locale,
        Option[EmailAddress],
        Option[PhoneNumber],
        Option[URL]
    ),
    var replayedEvents: Int
) extends ElectionT {

  def votes: Seq[Vote] = _votes.toSeq

  def copy(
      id: Id = this.id,
      created: Instant = this.created,
      updated: Instant = this.updated,
      organizerToken: AccessToken = this.organizerToken,
      voterToken: AccessToken = this.voterToken,
      visibility: Visibility = this.visibility,
      name: String = this.name,
      description: Option[String] = this.description,
      timeZone: Option[TimeZone] = this.timeZone,
      candidates: Set[LocalDateTime] = this.candidates,
      votes: Seq[Vote] = this.votes,
      subscriptions: (
          Locale,
          Option[EmailAddress],
          Option[PhoneNumber],
          Option[URL]
      ) = this.subscriptions,
      replayedEvents: Int = this.replayedEvents
  ) = new Election(
    id,
    created,
    updated,
    organizerToken,
    voterToken,
    visibility,
    name,
    description,
    timeZone,
    candidates,
    votes.toBuffer,
    subscriptions,
    replayedEvents
  )

  override def equals(that: Any) = that match {
    case v: Election => this.id == v.id
    case _           => false
  }

  override val hashCode = id.##

  def replay(events: Seq[ElectionEvent]): Election = {
    events.foreach(event => {
      assert(this.id == id)
      event match {
        case PublishedEvent(_, _, _, _) => assert(false)
        case RetextedEvent(_, name, description, _) =>
          this.name = name; this.description = description
        case CandidatesNominatedEvent(_, timeZone, candidates, _) =>
          this.timeZone = timeZone; this.candidates = candidates
        case ProtectedEvent(_, _)   => visibility = Protected
        case PrivatizedEvent(_, _)  => visibility = Private
        case RepublishedEvent(_, _) => visibility = Public
        case VotedEvent(
              _,
              name,
              timeZone,
              availabilities,
              occurred
            ) =>
          _votes += Vote(
            name,
            if (this.timeZone != None && timeZone != this.timeZone) {
              assert(timeZone != None)
              availabilities.map(_ match {
                case (ldt, a) =>
                  (
                    ZonedDateTime
                      .of(ldt, timeZone.getOrElse(TimeZone.getDefault).toZoneId)
                      .withZoneSameInstant(
                        this.timeZone.getOrElse(TimeZone.getDefault).toZoneId
                      )
                      .toLocalDateTime,
                    a
                  )
              })
            } else { availabilities },
            occurred
          )
        case VoteDeletedEvent(
              _,
              name,
              voted,
              _
            ) =>
          _votes
            .find(vote => vote.name == name && vote.voted == voted)
            .foreach(vote => _votes -= vote)
        case SubscribedEvent(_, locale, email, text, webHook, _) =>
          subscriptions = (locale, email, text, webHook)
      }
      replayedEvents += 1
      updated = event.occurred
    })
    this
  }
}

object Election {
  def apply(snapshot: ElectionT): Election = snapshot match {
    case e: Election => e
    case _ =>
      new Election(
        snapshot.id,
        snapshot.created,
        snapshot.updated,
        snapshot.organizerToken,
        snapshot.voterToken,
        snapshot.visibility,
        snapshot.name,
        snapshot.description,
        snapshot.timeZone,
        snapshot.candidates,
        snapshot.votes.toBuffer,
        snapshot.subscriptions,
        snapshot.replayedEvents
      )
  }

  def apply(events: Seq[ElectionEvent]): Election =
    events match {
      case PublishedEvent(
            id,
            organizerToken,
            voterToken,
            occurred
          ) :: eventsTail =>
        new Election(
          id,
          occurred,
          occurred,
          organizerToken,
          voterToken,
          Public,
          id.toString,
          None,
          None,
          Set.empty,
          Nil.toBuffer,
          (Locale.getDefault, None, None, None),
          1
        )
          .replay(eventsTail)
    }
}
