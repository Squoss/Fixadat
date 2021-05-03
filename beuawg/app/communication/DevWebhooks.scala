package communications

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
import ports.Webhooks
import java.net.URL

class DevWebhooks @Inject() (implicit ec: ExecutionContext) extends Webhooks {

  def notify(webhook: URL, text: String): Future[Unit] = Future(
    System.out.println(s"$webhook <= $text")
  )
}
