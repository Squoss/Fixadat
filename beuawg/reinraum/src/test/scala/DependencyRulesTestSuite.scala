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
  val DOMAIN_ENTITIES = "domain.entities.."
  val DOMAIN_EVENTSOURCING = "domain.event_sourcing.."
  val DOMAIN_PERSISTENCE = "domain.persistence.."
  val DOMAIN_SERVICES = "domain.services.."
  val DOMAIN_SPI = "domain.spi.."
  val DOMAIN_VALUEOBJECTS = "domain.value_objects.."
  val JAVA = "java.."
  val JAVAX = "javax.."
  val PHONENUMBERS = "com.google.i18n.phonenumbers.."
  val SCALA = "scala.."
  val THIRDPARTY_APIS = "thirdparty_apis.."

  val NOT_THE_APP =
    Seq(JAVA, JAVAX, SCALA)
  val THE_APP_INSIDE_THE_DOMAIN =
    Seq(
      DOMAIN_ENTITIES,
      DOMAIN_EVENTSOURCING,
      DOMAIN_PERSISTENCE,
      DOMAIN_SERVICES,
      DOMAIN_SPI,
      DOMAIN_VALUEOBJECTS
    )

  val classes =
    new ClassFileImporter().importPackages(THE_APP_INSIDE_THE_DOMAIN: _*)

  test("the domain depends on itself and third-party APIs only") {

    noClasses()
      .that()
      .resideInAnyPackage(THE_APP_INSIDE_THE_DOMAIN: _*)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP ++ THE_APP_INSIDE_THE_DOMAIN :+ PHONENUMBERS :+ THIRDPARTY_APIS): _*
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
        (NOT_THE_APP :+ PHONENUMBERS :+ DOMAIN_ENTITIES :+ DOMAIN_EVENTSOURCING :+ DOMAIN_VALUEOBJECTS :+ DOMAIN_PERSISTENCE): _*
      )
      .check(classes)
  }

  test(
    "only the domain services depend on the repositories port"
  ) {

    noClasses()
      .that()
      .resideOutsideOfPackages(DOMAIN_PERSISTENCE, DOMAIN_SERVICES)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DOMAIN_PERSISTENCE)
      .check(classes)
  }

  test("the services port depends on itself only") {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_SPI)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages((NOT_THE_APP :+ DOMAIN_SPI): _*)
      .check(classes)
  }

  test("only the domain services depend on the services port") {

    noClasses()
      .that()
      .resideOutsideOfPackages(DOMAIN_SPI, DOMAIN_SERVICES)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DOMAIN_SPI)
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
      .resideOutsideOfPackages(THIRDPARTY_APIS, DOMAIN_SERVICES)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(THIRDPARTY_APIS)
      .check(classes)
  }

  test(
    "the domain services depend on themselves, the domain types, and the ports only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_SERVICES)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_ENTITIES :+ DOMAIN_EVENTSOURCING :+ DOMAIN_VALUEOBJECTS :+ DOMAIN_PERSISTENCE :+ DOMAIN_SPI :+ THIRDPARTY_APIS :+ DOMAIN_SERVICES): _*
      )
      .check(classes)
  }

  test("nothing depends on the domain services") {

    noClasses()
      .that()
      .resideOutsideOfPackage(DOMAIN_SERVICES)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DOMAIN_SERVICES)
      .check(classes)
  }

  test("the entities depend on the domain types only") {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_ENTITIES)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_ENTITIES :+ DOMAIN_EVENTSOURCING :+ DOMAIN_VALUEOBJECTS): _*
      )
      .check(classes)
  }

  test("the events depend on themselves and the value objects only") {

    noClasses()
      .that()
      .resideInAPackage(DOMAIN_EVENTSOURCING)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ PHONENUMBERS :+ DOMAIN_EVENTSOURCING :+ DOMAIN_VALUEOBJECTS): _*
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
        (NOT_THE_APP :+ PHONENUMBERS :+ DOMAIN_VALUEOBJECTS): _*
      )
      .check(classes)
  }
}
