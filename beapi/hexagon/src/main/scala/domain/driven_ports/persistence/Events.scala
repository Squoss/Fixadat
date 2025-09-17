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

package domain.driven_ports.persistence

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.value_objects.AccessToken
import domain.value_objects.Availability
import domain.value_objects.Availability.*
import domain.value_objects.EmailAddress
import domain.value_objects.Id

import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.util.Locale
import java.util.TimeZone

sealed trait ElectionEvent {

  def id: Id
  def occurred: Instant
  def version: Int
}

final case class PublishedEvent(
    id: Id,
    organizerToken: AccessToken,
    voterToken: AccessToken,
    occurred: Instant
) extends ElectionEvent {

  val version = 1
}

final case class RetextedEvent(
    id: Id,
    name: String,
    description: Option[String],
    occurred: Instant
) extends ElectionEvent {

  val version = 1
}

final case class CandidatesNominatedEvent(
    id: Id,
    timeZone: Option[TimeZone],
    candidates: Set[LocalDateTime],
    occurred: Instant
) extends ElectionEvent {

  val version = 1
}

final case class SubscribedEvent(
    id: Id,
    locale: Locale,
    email: Option[EmailAddress],
    text: Option[PhoneNumber],
    webHook: Option[URL],
    occurred: Instant
) extends ElectionEvent {

  val version = 1
}

final case class ProtectedEvent(id: Id, occurred: Instant)
    extends ElectionEvent {

  val version = 1
}

final case class PrivatizedEvent(id: Id, occurred: Instant)
    extends ElectionEvent {

  val version = 1
}

final case class RepublishedEvent(id: Id, occurred: Instant)
    extends ElectionEvent {

  val version = 1
}

final case class VotedEvent(
    id: Id,
    name: String,
    timeZone: Option[TimeZone],
    availability: Map[LocalDateTime, Availability],
    occurred: Instant
) extends ElectionEvent {

  val version = 1
}

final case class VoteDeletedEvent(
    id: Id,
    name: String,
    voted: Instant,
    occurred: Instant
) extends ElectionEvent {

  val version = 1
}
