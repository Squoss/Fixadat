name := "Fixadat"

organization := "com.squeng"
organizationName := "Squeng AG"
organizationHomepage := Some(url("https://www.squeng.com/"))

homepage := Some(url("https://fixadat.com"))
startYear := Some(2021)
description := "a tip of the hat to classic Doodle"
licenses += "MIT" -> url("https://choosealicense.com/licenses/mit/")

version := "MVP"

lazy val root = (project in file("."))
    .enablePlugins(PlayScala)
// https://www.playframework.com/documentation/latest/SBTSubProjects#Adding-a-simple-library-sub-project
    .aggregate(reinraum)
    .dependsOn(reinraum)
lazy val reinraum = project

scalaVersion := "2.13.10"

libraryDependencies += guice
libraryDependencies += "com.google.inject" % "guice" % "5.1.0" // bumping the Guice version manually allows for using Play 2.8 with Java 17
libraryDependencies += ws
libraryDependencies += "org.mongodb.scala" %% "mongo-scala-driver" % "4.8.2"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "1.0.1" % Test

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.squeng.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.squeng.binders._"
