/*
 * The MIT License
 *
 * Copyright (c) 2021 Squeng AG
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

package dev

import domain.entities.Veranstaltung
import domain.persistence.Repository
import domain.persistence.VeranstaltungEvent
import domain.persistence.VeranstaltungPublishedEvent
import domain.value_objects.Id

import javax.inject.Inject
import javax.inject.Singleton
import scala.collection.mutable
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

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
