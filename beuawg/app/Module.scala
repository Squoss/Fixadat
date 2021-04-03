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
import com.google.inject.name.Names
import persistence.DevRepository
import persistence.Mdb
import play.api.Configuration
import play.api.Environment
import play.api.Mode
import ports.Repository

class Module(
    env: Environment,
    config: Configuration
) extends AbstractModule {
  override def configure() = {

    if (env.mode == Mode.Dev && config.get[Boolean]("mongodb.dev")) {
      bind(classOf[Repository])
        .to(classOf[DevRepository])
    } else {
      // https://www.playframework.com/documentation/2.8.x/ScalaDependencyInjection#Eager-bindings
      bind(classOf[Mdb]).asEagerSingleton
    }
  }
}
