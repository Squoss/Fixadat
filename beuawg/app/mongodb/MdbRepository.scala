package mongodb

import domain.entities.Veranstaltung
import domain.event_sourcing.VeranstaltungEvent
import domain.event_sourcing.VeranstaltungPublishedEvent
import domain.persistence.Repository
import domain.value_objects.Id
import play.api.Logging

import javax.inject.Inject
import scala.concurrent.Future

class MdbRepository @Inject() (val mdb: Mdb) extends Repository with Logging {

  override def logEvent(event: VeranstaltungPublishedEvent): Future[Boolean] =
    ???

  override def logEvent(event: VeranstaltungEvent): Future[Unit] = ???

  override def readEvents(
      id: Id
  ): Future[(Option[Veranstaltung], Seq[VeranstaltungEvent])] = ???

  override def fastForwardSnapshot(snapshot: Veranstaltung): Future[Unit] = ???

  override def deleteEvents(id: Id): Future[Unit] = ???
}
