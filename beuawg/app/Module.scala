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

import com.google.inject.AbstractModule
import dev.DevRepository
import domain.persistence.Repository
import domain.service_implementations.VeranstaltungenService
import domain.service_interfaces.Veranstaltungen
import mongodb.Mdb
import mongodb.MdbRepository
import play.api.Configuration
import play.api.Environment
import play.api.Logging
import play.api.Mode
import thirdparty_apis.Email
import thirdparty_apis.Sms
import thirdparty_apis.Webhooks

class Module(
    env: Environment,
    config: Configuration
) extends AbstractModule
    with Logging {
  override def configure() = {

    if (env.mode == Mode.Dev && !config.get[Boolean]("di.mongodb")) {
      bind(classOf[Repository]).to(classOf[DevRepository])
    } else {
      // https://www.playframework.com/documentation/2.8.x/ScalaDependencyInjection#Eager-bindings
      bind(classOf[Mdb]).asEagerSingleton
      bind(classOf[Repository]).to(classOf[MdbRepository])
    }

    val emailImplementationName = config.get[String]("di.email")
    val emailImplementationClass: Class[_ <: Email] = env.classLoader
      .loadClass(emailImplementationName)
      .asSubclass(classOf[Email])
    logger.debug(s"email implementation class is $emailImplementationClass")
    bind(classOf[Email]).to(emailImplementationClass)

    val smsImplementationName = config.get[String]("di.sms")
    val smsImplementationClass: Class[_ <: Sms] = env.classLoader
      .loadClass(smsImplementationName)
      .asSubclass(classOf[Sms])
    logger.debug(s"SMS implementation class is $smsImplementationClass")
    bind(classOf[Sms]).to(smsImplementationClass)

    val webhooksImplementationName = config.get[String]("di.webhooks")
    val webhooksImplementationClass: Class[_ <: Webhooks] = env.classLoader
      .loadClass(webhooksImplementationName)
      .asSubclass(classOf[Webhooks])
    logger.debug(
      s"webhooks implementation class is $webhooksImplementationClass"
    )
    bind(classOf[Webhooks]).to(webhooksImplementationClass)

    bind(classOf[Veranstaltungen]).to(classOf[VeranstaltungenService])
  }
}
