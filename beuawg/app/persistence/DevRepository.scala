package persistence

import javax.inject.Inject
import javax.inject.Singleton

import scala.collection.mutable
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

import domain.VeranstaltungEvent
import domain.VeranstaltungPublishedEvent
import domain.entities.Veranstaltung
import domain.value_objects.Id
import ports.Repository

@Singleton
class DevRepository @Inject() (implicit ec: ExecutionContext)
    extends Repository {

  private val eventsLog =
    mutable.Map[Id, mutable.Buffer[VeranstaltungEvent]]()

  override def logEvent(event: VeranstaltungPublishedEvent): Future[Boolean] =
    if (eventsLog.contains(event.id)) {
      Future(false)
    } else {
      eventsLog += event.id -> mutable.Buffer(event)
      Future(true)
    }

  override def logEvent(event: VeranstaltungEvent): Future[Unit] = {
    eventsLog(event.id) += event
    Future(())
  }

  override def readEvents(
      id: Id
  ): Future[(Option[Veranstaltung], Seq[VeranstaltungEvent])] = Future(
    (None, eventsLog.getOrElse(id, Nil).toSeq)
  )

  override def fastForwardSnapshot(snapshot: Veranstaltung): Future[Unit] =
    Future(())

  override def deleteEvents(id: Id): Future[Unit] = {
    eventsLog -= id
    Future(())
  }
}
