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

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import org.scalatest.funsuite.AnyFunSuite

class DependencyRulesTestSuite extends AnyFunSuite {

  val DEFAULT = ""
  val DOMAIN_ENTITYIMPS = "domain.entity_implementations.."
  val DOMAIN_ENTITYINTS = "domain.entity_interfaces.."
  val DOMAIN_PERSISTENCE = "domain.persistence.."
  val DOMAIN_SERVICEIMPS = "domain.service_implementations.."
  val DOMAIN_SERVICEINTS = "domain.service_interfaces.."
  val DOMAIN_VALUEOBJECTS = "domain.value_objects.."
  val JAVA = "java.."
  val JAVAX = "javax.."
  val PHONENUMBERS = "com.google.i18n.phonenumbers.."
  val SCALA = "scala.."
  val THIRDPARTY_APIS = "thirdparty_apis.."

  val NOT_THE_APP =
    Seq(JAVA, JAVAX, SCALA, PHONENUMBERS)
  val THE_APP_INSIDE_THE_DOMAIN =
    Seq(
      DOMAIN_ENTITYIMPS,
      DOMAIN_ENTITYINTS,
      DOMAIN_PERSISTENCE,
      DOMAIN_SERVICEIMPS,
      DOMAIN_SERVICEINTS,
      DOMAIN_VALUEOBJECTS
    )

  val classes =
    new ClassFileImporter().importPackages(
      (THE_APP_INSIDE_THE_DOMAIN :+ THIRDPARTY_APIS): _*
    )

  test("the domain depends on itself and third-party APIs only") {

    noClasses()
      .that()
      .resideInAnyPackage(THE_APP_INSIDE_THE_DOMAIN: _*)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP ++ THE_APP_INSIDE_THE_DOMAIN :+ THIRDPARTY_APIS): _*
      )
      .check(classes)
  }

  test(
    "the repositories port depends on itself and the domain types only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_PERSISTENCE)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_PERSISTENCE :+ DOMAIN_ENTITYINTS :+ DOMAIN_VALUEOBJECTS): _*
      )
      .check(classes)
  }

  test(
    "besides the repositories port, only the domain services and domain entities depend on the repositories port"
  ) {

    noClasses()
      .that()
      .resideOutsideOfPackages(
        DOMAIN_PERSISTENCE,
        DOMAIN_SERVICEIMPS,
        DOMAIN_ENTITYIMPS
      )
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DOMAIN_PERSISTENCE)
      .check(classes)
  }

  test("the services port depends on itself and the domain types only") {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_SERVICEINTS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_SERVICEINTS :+ DOMAIN_ENTITYINTS :+ DOMAIN_VALUEOBJECTS): _*
      )
      .check(classes)
  }

  test("only the domain services depend on the services port") {

    noClasses()
      .that()
      .resideOutsideOfPackages(DOMAIN_SERVICEIMPS)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DOMAIN_SERVICEINTS)
      .check(classes)
  }

  test("the third-party APIs port depends on itself only") {

    noClasses()
      .that()
      .resideInAPackage(THIRDPARTY_APIS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages((NOT_THE_APP :+ THIRDPARTY_APIS): _*)
      .check(classes)
  }

  test("only the domain services depend on the third-party APIs port") {

    noClasses()
      .that()
      .resideOutsideOfPackages(DOMAIN_SERVICEIMPS)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(THIRDPARTY_APIS)
      .check(classes)
  }

  test(
    "the domain services depend on themselves, the domain entities, the domain types, and the ports only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_SERVICEIMPS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_ENTITYIMPS :+ DOMAIN_ENTITYINTS :+ DOMAIN_VALUEOBJECTS :+ DOMAIN_PERSISTENCE :+ DOMAIN_SERVICEINTS :+ THIRDPARTY_APIS): _*
      )
      .check(classes)
  }

  test("nothing depends on the domain services") {

    noClasses()
      .that()
      .resideOutsideOfPackage(DOMAIN_SERVICEIMPS)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DOMAIN_SERVICEIMPS)
      .check(classes)
  }

  test(
    "the entities depend on the domain types and the domain (persistence) events only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_ENTITYIMPS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_ENTITYIMPS :+ DOMAIN_ENTITYINTS :+ DOMAIN_VALUEOBJECTS :+ DOMAIN_PERSISTENCE): _*
      )
      .check(classes)
  }

  test("the domain types depend on the value objects only") {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_ENTITYINTS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_ENTITYINTS :+ DOMAIN_VALUEOBJECTS): _*
      )
      .check(classes)
  }

  test("the value objects depend on themselves only") {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_VALUEOBJECTS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_VALUEOBJECTS): _*
      )
      .check(classes)
  }
}
