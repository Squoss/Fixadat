import api.EventsController
import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import org.scalatest.funsuite.AnyFunSuite

class DependencyRulesTestSuite extends AnyFunSuite {

  test("ArchUnit PoC") {
    val classes =
      new ClassFileImporter().importPackagesOf(classOf[EventsController])

    noClasses()
      .that()
      .resideInAPackage("api..")
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        "java..",
        "javax..",
        "scala..",
        "play.api..",
        "play.core..",
        "play.filters..",
        "router..",
        "com.google.i18n.phonenumbers..",
        "api..",
        "domain.value_objects..",
        "ports.."
      )
      .check(classes)
  }
}
