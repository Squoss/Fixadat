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

package mongodb

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import com.mongodb.DuplicateKeyException
import domain.entity_interfaces.ElectionT
import domain.persistence.CandidatesNominatedEvent
import domain.persistence.ElectionEvent
import domain.persistence.PrivatizedEvent
import domain.persistence.ProtectedEvent
import domain.persistence.PublishedEvent
import domain.persistence.Repository
import domain.persistence.RepublishedEvent
import domain.persistence.RetextedEvent
import domain.persistence.SubscribedEvent
import domain.persistence.VoteDeletedEvent
import domain.persistence.VotedEvent
import domain.value_objects.AccessToken
import domain.value_objects.Availability._
import domain.value_objects.EmailAddress
import domain.value_objects.Id
import domain.value_objects.Vote
import org.mongodb.scala.Document
import org.mongodb.scala.Observer
import org.mongodb.scala.bson.BsonArray
import org.mongodb.scala.bson.BsonBinary
import org.mongodb.scala.bson.BsonDocument
import org.mongodb.scala.bson.BsonInt32
import org.mongodb.scala.bson.BsonString
import org.mongodb.scala.bson.BsonTimestamp
import org.mongodb.scala.bson.BsonValue
import org.mongodb.scala.model.Filters
import org.mongodb.scala.model.IndexOptions
import org.mongodb.scala.model.Indexes
import org.mongodb.scala.model.Projections
import org.mongodb.scala.model.Updates
import play.api.Logging

import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.util.Locale
import java.util.TimeZone
import javax.inject.Inject
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.jdk.CollectionConverters._
import scala.util.Failure
import scala.util.Success

class MdbRepository @Inject() (implicit ec: ExecutionContext, val mdb: Mdb)
    extends Repository
    with Logging {

  val Collection = "elections"
  val IdKey = "id"
  val SnapshotKey = "snapshot"
  val CreatedKey = "created"
  val VisibilityKey = "visibility"
  val CandidatesKey = "candidates"
  val VotesKey = "votes"
  val UpdatedKey = "updated"
  val ReplayedEventsKey = "replayedEvents"
  val EventsKey = "events"
  val OccurredKey = "occurred"
  val VersionKey = "version"
  val VoterTokenKey = "voterToken"
  val OrganizerTokenKey = "organizerToken"
  val NameKey = "name"
  val DescriptionKey = "description"
  val DateTimeKey = "dateTime"
  val TimeZoneKey = "timeZone"
  val UrlKey = "url"
  val SubscriptionsKey = "subscriptions"
  val LocaleKey = "locale"
  val EmailAddressKey = "ea"
  val PhoneNumberKey = "pn"
  val AvailabilityKey = "availability"
  val VotedKey = "voted"
  val TypeKey = "et"
  val PublishedValue = "published"
  val RetextedValue = "retexted"
  val CandidatesNominatedValue = "candidatesNominated"
  val SubscribedValue = "subscribed"
  val ProtectedValue = "protected"
  val PrivatizedValue = "privatized"
  val RepublishedValue = "republished"
  val VotedValue = "voted"
  val VoteDeletedValue = "voteDeleted"

  logger.info(s"ensuring indices for ${Collection}")
  mdb(Collection)
    .createIndex(
      Indexes.ascending(IdKey),
      IndexOptions().unique(true)
    )
    .subscribe(
      new Observer[String] {

        override def onNext(s: String): Unit = {
          logger.info(s"created indices ${s} for ${Collection}")
        }

        override def onError(e: Throwable): Unit = {
          logger.error(s"failed to create indices for ${Collection}", e)
        }

        override def onComplete(): Unit = {
          logger.info(s"created indices for ${Collection}")
        }
      }
    )

  override def logEvent(event: PublishedEvent): Future[Boolean] = {
    val document = Document(
      IdKey -> event.id.wert,
      ReplayedEventsKey -> 0,
      EventsKey -> Seq(
        Document(
          TypeKey -> PublishedValue,
          OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
          VersionKey -> event.version,
          OrganizerTokenKey -> new BsonBinary(event.organizerToken.wert),
          VoterTokenKey -> new BsonBinary(event.voterToken.wert)
        )
      )
    )
    mdb(Collection)
      .insertOne(document)
      .toFuture()
      .transform(_ match {
        case Success(_)                                => Success(true)
        case Failure(exception: DuplicateKeyException) => Success(false)
        case Failure(throwable)                        => Failure(throwable)
      })
  }

  private def logEvent(id: Id, document: Document): Future[Unit] =
    mdb(Collection)
      .updateOne(
        Filters.equal(IdKey, id.wert),
        Updates.push(EventsKey, document)
      )
      .toFuture()
      .map(_ => ())

  private def logEvent(
      event: ElectionEvent,
      typeValue: String
  ): Future[Unit] = {
    require(
      typeValue == ProtectedValue || typeValue == PrivatizedValue || typeValue == RepublishedValue
    )

    val document = Document(
      TypeKey -> typeValue,
      OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
      VersionKey -> event.version
    )
    logEvent(event.id, document)
  }

  override def logEvent(event: ElectionEvent): Future[Unit] = event match {
    case PublishedEvent(_, _, _, _) =>
      val msg =
        "PublishedEvent case should have been handled by logEvent(PublishedEvent)"
      logger.error(msg)
      Future.failed(new RuntimeException(msg))
    case RetextedEvent(_, name, description, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> RetextedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        NameKey -> name
      )
      description.foreach(d => document += (DescriptionKey -> d))
      logEvent(event.id, document.toBsonDocument)
    case CandidatesNominatedEvent(_, timeZone, candidates, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> CandidatesNominatedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        CandidatesKey -> fromCandidates(candidates)
      )
      timeZone.foreach(tz => document += (TimeZoneKey -> tz.getID))
      logEvent(event.id, document.toBsonDocument)
    case SubscribedEvent(_, locale, email, text, webHook, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> SubscribedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        LocaleKey -> locale.toLanguageTag
      )
      email.foreach(ea => document += (EmailAddressKey -> ea.wert))
      text.foreach(pn =>
        document += (PhoneNumberKey -> PhoneNumberUtil
          .getInstance()
          .format(pn, PhoneNumberFormat.E164))
      )
      webHook.foreach(u => document += (UrlKey -> u.toExternalForm))
      logEvent(event.id, document.toBsonDocument)
    case ProtectedEvent(_, _) =>
      logEvent(event, ProtectedValue)
    case PrivatizedEvent(_, _) =>
      logEvent(event, PrivatizedValue)
    case RepublishedEvent(_, _) =>
      logEvent(event, RepublishedValue)
    case VotedEvent(_, name, timeZone, availability, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> VotedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        NameKey -> name,
        AvailabilityKey -> fromAvailability(availability)
      )
      timeZone.foreach(tz => document += (TimeZoneKey -> tz.getID))
      logEvent(event.id, document.toBsonDocument)
    case VoteDeletedEvent(_, name, voted, _) =>
      val document = Document(
        TypeKey -> VoteDeletedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        NameKey -> name,
        VotedKey -> new BsonTimestamp(voted.toEpochMilli)
      )
      logEvent(event.id, document)
  }

  private def toElectionEvent(id: Id, doc: Document) = {
    val eventType = doc(TypeKey).asString.getValue
    val version = doc(VersionKey).asInt32.getValue
    assume(version == 1)

    eventType match {
      case PublishedValue =>
        PublishedEvent(
          id,
          AccessToken(doc(OrganizerTokenKey).asBinary.asUuid),
          AccessToken(doc(VoterTokenKey).asBinary.asUuid),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RetextedValue =>
        RetextedEvent(
          id,
          doc(NameKey).asString.getValue,
          doc.get(DescriptionKey).map(_.asString.getValue),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case CandidatesNominatedValue =>
        CandidatesNominatedEvent(
          id,
          doc
            .get(TimeZoneKey)
            .map(tz => TimeZone.getTimeZone(tz.asString.getValue)),
          doc(CandidatesKey).asArray.getValues.asScala.toSet.map(
            (bv: BsonValue) => LocalDateTime.parse(bv.asString.getValue)
          ),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case SubscribedValue =>
        val subscriptions = toSubscriptions(doc(SubscriptionsKey).asDocument)
        SubscribedEvent(
          id,
          subscriptions._1,
          subscriptions._2,
          subscriptions._3,
          subscriptions._4,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case ProtectedValue =>
        ProtectedEvent(
          id,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case PrivatizedValue =>
        PrivatizedEvent(
          id,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RepublishedValue =>
        RepublishedEvent(
          id,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case VotedValue =>
        VotedEvent(
          id,
          doc(NameKey).asString.getValue,
          doc
            .get(TimeZoneKey)
            .map(tz => TimeZone.getTimeZone(tz.asString.getValue)),
          toAvailability(doc(AvailabilityKey).asDocument),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case VoteDeletedValue =>
        VoteDeletedEvent(
          id,
          doc(NameKey).asString.getValue,
          Instant.ofEpochMilli(doc(VotedKey).asTimestamp.getValue),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
    }
  }

  private def toVote(document: Document) = Vote(
    document(NameKey).asString.getValue,
    toAvailability(document(AvailabilityKey).asDocument),
    Instant
      .ofEpochMilli(document(VotedKey).asTimestamp.getValue)
  )

  private def toSnapshot(id: Id, document: Document, replayedEvents: Int) =
    ElectionSnapshot(
      id,
      Instant
        .ofEpochMilli(document(CreatedKey).asTimestamp.getValue),
      Instant
        .ofEpochMilli(document(UpdatedKey).asTimestamp.getValue),
      AccessToken(document(OrganizerTokenKey).asBinary.asUuid),
      AccessToken(document(VoterTokenKey).asBinary.asUuid),
      document(NameKey).asString.getValue,
      document.get(DescriptionKey).map(_.asString.getValue),
      document
        .get(TimeZoneKey)
        .map(tz => TimeZone.getTimeZone(tz.asString.getValue)),
      document(CandidatesKey).asArray.getValues.asScala.toSet.map(
        (bv: BsonValue) => LocalDateTime.parse(bv.asString.getValue)
      ),
      document(VotesKey).asArray.getValues.asScala.toSeq.map(bv =>
        toVote(bv.asDocument)
      ),
      domain.value_objects
        .Visibility(document(VisibilityKey).asInt32.getValue),
      toSubscriptions(document(SubscriptionsKey).asDocument),
      replayedEvents
    )

  override def readEvents(
      id: Id
  ): Future[(Option[ElectionT], Seq[ElectionEvent])] = mdb(
    Collection
  ).find(Filters.equal(IdKey, id.wert))
    .projection(Projections.exclude(EventsKey))
    .toFuture()
    .flatMap(_ match {
      case Nil => Future((None, Seq()))
      case Seq(document) =>
        val replayedEvents = document(ReplayedEventsKey).asInt32.getValue
        mdb(Collection)
          .find(Filters.equal(IdKey, id.wert))
          .projection(
            Projections.slice(EventsKey, replayedEvents, Int.MaxValue)
          )
          .toFuture()
          .map(docs =>
            (
              if (replayedEvents > 0) {
                Some(
                  toSnapshot(
                    id,
                    document(SnapshotKey).asDocument,
                    replayedEvents
                  )
                )
              } else { None },
              docs
                .head(EventsKey)
                .asArray
                .getValues
                .asScala
                .map(eventDoc =>
                  toElectionEvent(
                    Id(document(IdKey).asInt32.getValue),
                    eventDoc.asDocument
                  )
                )
                .toSeq
            )
          )
      case documents =>
        val msg =
          s"DB corrupt! found ${documents.size} documents with supposedly unique id ${id}"
        logger.error(msg)
        Future.failed(new RuntimeException(msg))
    })

  private def fromCandidates(candidates: Set[LocalDateTime]): BsonArray = {
    val bsonArray = new BsonArray()
    candidates.foreach(candidate =>
      bsonArray.add(new BsonString(candidate.toString))
    )
    bsonArray
  }

  private def fromAvailability(
      availabilities: Map[LocalDateTime, Availability]
  ): BsonDocument = {
    val bsonDocument = new BsonDocument()
    availabilities.foreach(_ match {
      case (ldt, a) => bsonDocument.append(ldt.toString, new BsonInt32(a.id))
    })
    bsonDocument
  }

  private def toAvailability(document: Document) = {
    document.toMap.map(_ match {
      case (ldt, a) =>
        (
          LocalDateTime.parse(ldt),
          domain.value_objects.Availability(a.asInt32.getValue)
        )
    })
  }

  private def fromVotes(votes: Seq[Vote]): BsonArray = {
    val bsonArray = new BsonArray()
    votes.foreach(vote => {
      val document = org.mongodb.scala.bson.collection.mutable
        .Document(
          NameKey -> vote.name,
          AvailabilityKey -> fromAvailability(vote.availability)
        )
      bsonArray.add(document.toBsonDocument)
    })
    bsonArray
  }

  private def fromSubscriptions(
      subscriptions: (
          Locale,
          Option[EmailAddress],
          Option[PhoneNumber],
          Option[URL]
      )
  ): BsonDocument = {
    val bsonDocument = new BsonDocument()
    bsonDocument.append(
      LocaleKey,
      new BsonString(subscriptions._1.toLanguageTag)
    )
    subscriptions._2.foreach(ea =>
      bsonDocument.append(EmailAddressKey, new BsonString(ea.wert))
    )
    subscriptions._3.foreach(pn =>
      bsonDocument.append(
        PhoneNumberKey,
        new BsonString(
          PhoneNumberUtil
            .getInstance()
            .format(pn, PhoneNumberFormat.E164)
        )
      )
    )
    subscriptions._4.foreach(u =>
      bsonDocument.append(UrlKey, new BsonString(u.toExternalForm))
    )
    bsonDocument
  }

  private def toSubscriptions(document: Document) = {
    (
      Locale.forLanguageTag(document(LocaleKey).asString.getValue),
      document
        .get(EmailAddressKey)
        .map(ea => EmailAddress(ea.asString.getValue)),
      document
        .get(PhoneNumberKey)
        .map(pn =>
          PhoneNumberUtil.getInstance().parse(pn.asString.getValue, "CH")
        ),
      document.get(UrlKey).map(u => new URL(u.asString.getValue))
    )
  }

  private def fastForwardSnapshot(
      snapshot: ElectionSnapshot
  ): Future[Unit] = {
    val document = org.mongodb.scala.bson.collection.mutable.Document(
      CreatedKey -> new BsonTimestamp(snapshot.created.toEpochMilli),
      UpdatedKey -> new BsonTimestamp(snapshot.created.toEpochMilli),
      OrganizerTokenKey -> new BsonBinary(snapshot.organizerToken.wert),
      VoterTokenKey -> new BsonBinary(snapshot.voterToken.wert),
      VisibilityKey -> snapshot.visibility.id,
      NameKey -> snapshot.name,
      CandidatesKey -> fromCandidates(snapshot.candidates),
      VotesKey -> fromVotes(snapshot.votes),
      SubscriptionsKey -> fromSubscriptions(snapshot.subscriptions)
    )
    snapshot.description.foreach(d => document += (DescriptionKey -> d))
    snapshot.timeZone.foreach(tz => document += (TimeZoneKey -> tz.getID))
    mdb(Collection)
      .updateOne(
        Filters.and(
          Filters.equal(IdKey, snapshot.id.wert),
          Filters.lt(ReplayedEventsKey, snapshot.replayedEvents)
        ),
        Updates.combine(
          Updates.set(ReplayedEventsKey, snapshot.replayedEvents),
          Updates.set(SnapshotKey, document)
        )
      )
      .toFuture()
      .map(_ => ())
  }

  override def fastForwardSnapshot(
      election: ElectionT
  ): Future[Unit] = election match {
    case es: ElectionSnapshot => fastForwardSnapshot(es)
    case _                    => Future.successful(())
  }

  override def deleteEvents(id: Id): Future[Unit] = mdb(
    Collection
  ).deleteOne(Filters.equal(IdKey, id.wert))
    .toFuture()
    .map(_ => ())
}
