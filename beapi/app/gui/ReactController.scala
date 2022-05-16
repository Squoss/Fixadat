/*
 * The MIT License
 *
 * Copyright (c) 2021-2022 Squeng AG
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

package gui

import play.api.Environment
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request
import play.filters.csrf.CSRF

import javax.inject.Inject
import javax.inject.Singleton
import scala.io.Codec
import scala.io.Source

@Singleton
class ReactController @Inject() (
    val controllerComponents: ControllerComponents,
    val env: Environment
) extends BaseController {

  val is = env.classLoader.getResourceAsStream("public/build/index.html")
  val bufferedSource = Source.createBufferedSource(
    inputStream = is,
    close = () => is.close()
  )(Codec.UTF8)
  val stringBuilder = bufferedSource.addString(new StringBuilder())
  val indexHtml = stringBuilder.mkString

  def guiFile(reactFile: String) = Action {
    implicit request: Request[AnyContent] =>
      implicit val ec: scala.concurrent.ExecutionContext =
        scala.concurrent.ExecutionContext.global
      Ok.sendResource(
        s"public/build/$reactFile",
        env.classLoader
      ) // TODO/FIXME: check for path-traversal vulnerability
  }

  def guiRoute(reactRoute: String) = Action {
    implicit request: Request[AnyContent] =>
      val token =
        CSRF.getToken // // https://www.playframework.com/documentation/latest/ScalaCsrf#Getting-the-current-token
      Ok(indexHtml.replace("REPLACE_CSRF_TOKEN", token.get.value))
        .as("text/html")
  }
}
