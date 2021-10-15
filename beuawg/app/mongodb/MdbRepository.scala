package mongodb

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
import domain.value_objects.Id
import org.mongodb.scala.bson.BsonArray
import org.mongodb.scala.bson.BsonBinary
import org.mongodb.scala.bson.BsonNull
import org.mongodb.scala.Document
import org.mongodb.scala.Observer
import org.mongodb.scala.model.Filters
import org.mongodb.scala.model.IndexOptions
import org.mongodb.scala.model.Indexes
import play.api.Logging

import java.time.Instant
import java.util.Date
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
  val EventsKey = "events"
  val OccurredKey = "occurred"
  val VersionKey = "version"
  val GuestTokenKey = "guestToken"
  val HostTokenKey = "hostToken"
  val TypeKey = "type"
  val PublishedValue = "published"

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
      EventsKey -> Seq(
        Document(
          TypeKey -> PublishedValue,
          OccurredKey -> new Date(event.occurred.toEpochMilli),
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

  override def logEvent(event: VeranstaltungEvent): Future[Unit] = event match {
    case VeranstaltungPublishedEvent(_, _, _, _) =>
      val msg =
        "VeranstaltungPublishedEvent case should have been handled by logEvent(VeranstaltungPublishedEvent)"
      logger.error(msg)
      Future.failed(new RuntimeException(msg))
    case VeranstaltungRetextedEvent(id, name, description, occurred) => ???
    case VeranstaltungRescheduledEvent(id, date, time, timeZone, occurred) =>
      ???
    case VeranstaltungRelocatedEvent(id, url, geo, occurred) => ???
    case VeranstaltungRecalibratedEvent(
          id,
          emailAddressRequired,
          phoneNumberRequired,
          plus1Allowed,
          occurred
        ) =>
      ???
    case VeranstaltungProtectedEvent(id, occurred)   => ???
    case VeranstaltungPrivatizedEvent(id, occurred)  => ???
    case VeranstaltungRepublishedEvent(id, occurred) => ???
    case RsvpEvent(id, nmae, emailAddress, phoneNumber, attendance, occurred) =>
      ???
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
          Instant.ofEpochMilli(doc(OccurredKey).asDateTime.getValue)
        )
      case _ => ???
    }
  }

  override def readEvents(
      id: Id
  ): Future[(Option[HostVeranstaltung], Seq[VeranstaltungEvent])] = mdb(
    Collection
  ).find(Filters.equal(IdKey, id.wert))
    .toFuture()
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

  override def fastForwardSnapshot(snapshot: HostVeranstaltung): Future[Unit] =
    Future(())

  override def deleteEvents(id: Id): Future[Unit] = ???
}
