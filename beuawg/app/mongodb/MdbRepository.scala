package mongodb

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat
import com.mongodb.DuplicateKeyException
import domain.entity_interfaces.HostVeranstaltung
import domain.persistence.Repository
import domain.persistence.RsvpEvent
import domain.persistence.VeranstaltungEvent
import domain.persistence.VeranstaltungPrivatizedEvent
import domain.persistence.VeranstaltungProtectedEvent
import domain.persistence.VeranstaltungPublishedEvent
import domain.persistence.VeranstaltungRecalibratedEvent
import domain.persistence.VeranstaltungRelocatedEvent
import domain.persistence.VeranstaltungRepublishedEvent
import domain.persistence.VeranstaltungRescheduledEvent
import domain.persistence.VeranstaltungRetextedEvent
import domain.value_objects.AccessToken
import domain.value_objects.EmailAddress
import domain.value_objects.Geo
import domain.value_objects.Id
import domain.value_objects.Rsvp
import org.mongodb.scala.Document
import org.mongodb.scala.Observer
import org.mongodb.scala.bson.BsonArray
import org.mongodb.scala.bson.BsonBinary
import org.mongodb.scala.bson.BsonDocument
import org.mongodb.scala.bson.BsonTimestamp
import org.mongodb.scala.model.Filters
import org.mongodb.scala.model.IndexOptions
import org.mongodb.scala.model.Indexes
import org.mongodb.scala.model.Projections
import org.mongodb.scala.model.Updates
import play.api.Logging

import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
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

  val Collection = "veranstaltungen"
  val IdKey = "id"
  val SnapshotKey = "snapshot"
  val CreatedKey = "created"
  val VisibilityKey = "visibility"
  val RsvpsKey = "rsvps"
  val UpdatedKey = "updated"
  val ReplayedEventsKey = "replayedEvents"
  val EventsKey = "events"
  val OccurredKey = "occurred"
  val VersionKey = "version"
  val GuestTokenKey = "guestToken"
  val HostTokenKey = "hostToken"
  val NameKey = "name"
  val DescriptionKey = "description"
  val DateKey = "date"
  val TimeKey = "time"
  val TimeZoneKey = "timeZone"
  val UrlKey = "url"
  val GeoKey = "geo"
  val EmailAddressRequiredKey = "ear"
  val PhoneNumberRequiredKey = "pnr"
  val Plus1AllowedKey = "p1a"
  val EmailAddressKey = "ea"
  val PhoneNumberKey = "pn"
  val AttendanceKey = "attendance"
  val TypeKey = "et"
  val PublishedValue = "published"
  val RetextedValue = "retexted"
  val RescheduledValue = "rescheduled"
  val RelocatedValue = "relocated"
  val RecalibratedValue = "recalibrated"
  val ProtectedValue = "protected"
  val PrivatizedValue = "privatized"
  val RepublishedValue = "republished"
  val RsvpValue = "rsvp"

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

  override def logEvent(event: VeranstaltungPublishedEvent): Future[Boolean] = {
    val document = Document(
      IdKey -> event.id.wert,
      ReplayedEventsKey -> 0,
      EventsKey -> Seq(
        Document(
          TypeKey -> PublishedValue,
          OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
          VersionKey -> event.version,
          GuestTokenKey -> new BsonBinary(event.guestToken.wert),
          HostTokenKey -> new BsonBinary(event.hostToken.wert)
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
      event: VeranstaltungEvent,
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

  override def logEvent(event: VeranstaltungEvent): Future[Unit] = event match {
    case VeranstaltungPublishedEvent(_, _, _, _) =>
      val msg =
        "VeranstaltungPublishedEvent case should have been handled by logEvent(VeranstaltungPublishedEvent)"
      logger.error(msg)
      Future.failed(new RuntimeException(msg))
    case VeranstaltungRetextedEvent(_, name, description, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> RetextedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        NameKey -> name
      )
      description.foreach(d => document += (DescriptionKey -> d))
      logEvent(event.id, document.toBsonDocument)
    case VeranstaltungRescheduledEvent(_, date, time, timeZone, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> RescheduledValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version
      )
      date.foreach(d => document += (DateKey -> d.toString))
      time.foreach(t => document += (TimeKey -> t.toString))
      timeZone.foreach(tz => document += (TimeZoneKey -> tz.getID))
      logEvent(event.id, document.toBsonDocument)
    case VeranstaltungRelocatedEvent(_, url, geo, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> RelocatedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version
      )
      url.foreach(u => document += (UrlKey -> u.toExternalForm))
      geo.foreach(g => {
        val geoDoc = org.mongodb.scala.bson.collection.mutable.Document(
          "geoJson" -> Document(
            "type" -> "Point",
            "coordinates" -> BsonArray(g.longitude, g.latitude)
          )
        )
        g.name.foreach(n => geoDoc += ("name" -> n))
        document += (GeoKey -> geoDoc)
      })
      logEvent(event.id, document.toBsonDocument)
    case VeranstaltungRecalibratedEvent(
          _,
          emailAddressRequired,
          phoneNumberRequired,
          plus1Allowed,
          _
        ) =>
      val document = Document(
        TypeKey -> RecalibratedValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        EmailAddressRequiredKey -> emailAddressRequired,
        PhoneNumberRequiredKey -> phoneNumberRequired,
        Plus1AllowedKey -> plus1Allowed
      )
      logEvent(event.id, document)
    case VeranstaltungProtectedEvent(_, _) =>
      logEvent(event, ProtectedValue)
    case VeranstaltungPrivatizedEvent(_, _) =>
      logEvent(event, PrivatizedValue)
    case VeranstaltungRepublishedEvent(_, _) =>
      logEvent(event, RepublishedValue)
    case RsvpEvent(_, name, emailAddress, phoneNumber, attendance, _) =>
      val document = org.mongodb.scala.bson.collection.mutable.Document(
        TypeKey -> RsvpValue,
        OccurredKey -> new BsonTimestamp(event.occurred.toEpochMilli),
        VersionKey -> event.version,
        NameKey -> name,
        AttendanceKey -> attendance.id
      )
      emailAddress.foreach(ea => document += (EmailAddressKey -> ea.wert))
      phoneNumber.foreach(pn =>
        document += (PhoneNumberKey -> PhoneNumberUtil
          .getInstance()
          .format(pn, PhoneNumberFormat.E164))
      )
      logEvent(event.id, document.toBsonDocument)
  }

  private def toGeo(doc: Document) = {
    val coordinates =
      doc("geoJson").asDocument.get("coordinates").asArray.getValues.asScala
    Geo(
      doc.get("name").map(_.asString.getValue),
      coordinates(0).asDouble.getValue,
      coordinates(1).asDouble.getValue
    )
  }

  private def toVeranstaltungEvent(id: Id, doc: Document) = {
    val eventType = doc(TypeKey).asString.getValue
    val version = doc(VersionKey).asInt32.getValue
    assume(version == 1)

    eventType match {
      case PublishedValue =>
        VeranstaltungPublishedEvent(
          id,
          AccessToken(doc(GuestTokenKey).asBinary.asUuid),
          AccessToken(doc(HostTokenKey).asBinary.asUuid),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RetextedValue =>
        VeranstaltungRetextedEvent(
          id,
          doc(NameKey).asString.getValue,
          doc.get(DescriptionKey).map(_.asString.getValue),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RescheduledValue =>
        VeranstaltungRescheduledEvent(
          id,
          doc.get(DateKey).map(d => LocalDate.parse(d.asString.getValue)),
          doc.get(TimeKey).map(t => LocalTime.parse(t.asString.getValue)),
          doc
            .get(TimeZoneKey)
            .map(tz => TimeZone.getTimeZone(tz.asString.getValue)),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RelocatedValue =>
        VeranstaltungRelocatedEvent(
          id,
          doc.get(UrlKey).map(u => new URL(u.asString.getValue)),
          doc.get(GeoKey).map(g => toGeo(g.asDocument)),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RecalibratedValue =>
        VeranstaltungRecalibratedEvent(
          id,
          doc(EmailAddressRequiredKey).asBoolean.getValue,
          doc(PhoneNumberRequiredKey).asBoolean.getValue,
          doc(Plus1AllowedKey).asBoolean.getValue,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case ProtectedValue =>
        VeranstaltungProtectedEvent(
          id,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case PrivatizedValue =>
        VeranstaltungPrivatizedEvent(
          id,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RepublishedValue =>
        VeranstaltungRepublishedEvent(
          id,
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
      case RsvpValue =>
        RsvpEvent(
          id,
          doc(NameKey).asString.getValue,
          doc
            .get(EmailAddressKey)
            .map(ea => EmailAddress(ea.asString.getValue)),
          doc
            .get(PhoneNumberKey)
            .map(pn =>
              PhoneNumberUtil.getInstance().parse(pn.asString.getValue, "CH")
            ),
          domain.value_objects.Attendance(doc(AttendanceKey).asInt32.getValue),
          Instant.ofEpochMilli(doc(OccurredKey).asTimestamp.getValue)
        )
    }
  }

  private def toRsvp(document: Document) = Rsvp(
    document(NameKey).asString.getValue,
    document
      .get(EmailAddressKey)
      .map(ea => EmailAddress(ea.asString.getValue)),
    document
      .get(PhoneNumberKey)
      .map(pn =>
        PhoneNumberUtil.getInstance().parse(pn.asString.getValue, "CH")
      ),
    domain.value_objects.Attendance(document(AttendanceKey).asInt32.getValue)
  )

  private def toSnapshot(id: Id, document: Document, replayedEvents: Int) =
    VeranstaltungSnapshot(
      id,
      Instant
        .ofEpochMilli(document(CreatedKey).asTimestamp.getValue),
      AccessToken(document(GuestTokenKey).asBinary.asUuid),
      AccessToken(document(HostTokenKey).asBinary.asUuid),
      document(NameKey).asString.getValue,
      document.get(DescriptionKey).map(_.asString.getValue),
      document
        .get(DateKey)
        .map(d => LocalDate.parse(d.asString.getValue)),
      document
        .get(TimeKey)
        .map(t => LocalTime.parse(t.asString.getValue)),
      document
        .get(TimeZoneKey)
        .map(tz => TimeZone.getTimeZone(tz.asString.getValue)),
      document.get(UrlKey).map(u => new URL(u.asString.getValue)),
      document.get(GeoKey).map(g => toGeo(g.asDocument)),
      document(EmailAddressRequiredKey).asBoolean.getValue,
      document(PhoneNumberRequiredKey).asBoolean.getValue,
      document(Plus1AllowedKey).asBoolean.getValue,
      domain.value_objects
        .Visibility(document(VisibilityKey).asInt32.getValue),
      document(RsvpsKey).asArray.getValues.asScala.toSeq.map(bv =>
        toRsvp(bv.asDocument)
      ),
      Instant
        .ofEpochMilli(document(UpdatedKey).asTimestamp.getValue),
      replayedEvents
    )

  override def readEvents(
      id: Id
  ): Future[(Option[HostVeranstaltung], Seq[VeranstaltungEvent])] = mdb(
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
                  toVeranstaltungEvent(
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
  /*
    .transform(_ match {
      case Success(Nil) => Success((None, Seq()))
      case Success(Seq(document)) =>
        Success(
          (
            None,
            document(EventsKey).asArray.getValues.asScala
              .map(eventDoc =>
                toVeranstaltungEvent(
                  Id(document(IdKey).asInt32.getValue),
                  eventDoc.asDocument
                )
              )
              .toSeq
          )
        )
      case Success(documents) =>
        val msg =
          s"DB corrupt! found ${documents.size} documents with supposedly unique id ${id}"
        logger.error(msg)
        Failure(new RuntimeException(msg))
      case Failure(exception) => Failure(exception)
    })
   */

  private def fromRsvps(rsvps: Seq[Rsvp]): BsonArray = {
    val bsonArray = new BsonArray()
    rsvps.foreach(rsvp => {
      val document = org.mongodb.scala.bson.collection.mutable
        .Document(NameKey -> rsvp.name, AttendanceKey -> rsvp.attendance.id)
      rsvp.emailAddress.foreach(ea => document += (EmailAddressKey -> ea.wert))
      rsvp.phoneNumber.foreach(pn =>
        document += (PhoneNumberKey -> PhoneNumberUtil
          .getInstance()
          .format(pn, PhoneNumberFormat.E164))
      )
      bsonArray.add(document.toBsonDocument)
    })
    bsonArray
  }
  override def fastForwardSnapshot(
      snapshot: HostVeranstaltung
  ): Future[Unit] = {
    val document = org.mongodb.scala.bson.collection.mutable.Document(
      CreatedKey -> new BsonTimestamp(snapshot.created.toEpochMilli),
      GuestTokenKey -> new BsonBinary(snapshot.guestToken.wert),
      HostTokenKey -> new BsonBinary(snapshot.hostToken.wert),
      NameKey -> snapshot.name,
      EmailAddressRequiredKey -> snapshot.emailAddressRequired,
      PhoneNumberRequiredKey -> snapshot.phoneNumberRequired,
      Plus1AllowedKey -> snapshot.plus1Allowed,
      VisibilityKey -> snapshot.visibility.id,
      RsvpsKey -> fromRsvps(snapshot.rsvps),
      UpdatedKey -> new BsonTimestamp(snapshot.created.toEpochMilli)
    )
    snapshot.description.foreach(d => document += (DescriptionKey -> d))
    snapshot.date.foreach(d => document += (DateKey -> d.toString))
    snapshot.time.foreach(t => document += (TimeKey -> t.toString))
    snapshot.timeZone.foreach(tz => document += (TimeZoneKey -> tz.getID))
    snapshot.url.foreach(u => document += (UrlKey -> u.toExternalForm))
    snapshot.geo.foreach(g => {
      val geoDoc = org.mongodb.scala.bson.collection.mutable.Document(
        "geoJson" -> Document(
          "type" -> "Point",
          "coordinates" -> BsonArray(g.longitude, g.latitude)
        )
      )
      g.name.foreach(n => geoDoc += ("name" -> n))
      document += (GeoKey -> geoDoc)
    })
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

  override def deleteEvents(id: Id): Future[Unit] = mdb(
    Collection
  ).deleteOne(Filters.equal(IdKey, id.wert))
    .toFuture()
    .map(_ => ())
}
