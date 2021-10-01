package mongodb

import domain.entity_interfaces.HostVeranstaltung
import domain.persistence.Repository
import domain.persistence.VeranstaltungEvent
import domain.persistence.VeranstaltungPublishedEvent
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
  ): Future[(Option[HostVeranstaltung], Seq[VeranstaltungEvent])] = ???

  override def fastForwardSnapshot(snapshot: HostVeranstaltung): Future[Unit] =
    ???

  override def deleteEvents(id: Id): Future[Unit] = ???
}
