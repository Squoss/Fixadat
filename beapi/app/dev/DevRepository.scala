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

package dev

import domain.driven_ports.persistence.Repository
import domain.driven_ports.persistence.ElectionEvent
import domain.driven_ports.persistence.PublishedEvent
import domain.entity_interfaces.ElectionT
import domain.value_objects.Id
import play.api.Logging

import javax.inject.Inject
import javax.inject.Singleton
import scala.collection.mutable
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

@Singleton
class DevRepository @Inject() (implicit ec: ExecutionContext)
    extends Repository
    with Logging {

  private val eventsLog =
    mutable.Map[Id, mutable.Buffer[ElectionEvent]]()

  override def logEvent(event: PublishedEvent): Future[Boolean] =
    if (eventsLog.contains(event.id)) {
      Future(false)
    } else {
      eventsLog += event.id -> mutable.Buffer(event)
      Future(true)
    }

  override def logEvent(event: ElectionEvent): Future[Unit] = {
    logger.info(s"adding event ${event}")

    eventsLog(event.id) += event
    Future(())
  }

  override def readEvents(
      id: Id
  ): Future[(Option[ElectionT], Seq[ElectionEvent])] = Future(
    (None, eventsLog.getOrElse(id, Nil).toSeq)
  )

  override def fastForwardSnapshot(
      snapshot: ElectionT
  ): Future[Unit] =
    Future(())

  override def deleteEvents(id: Id): Future[Unit] = {
    eventsLog -= id
    Future(())
  }
}
