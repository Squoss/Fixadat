name := "Squawg"

organization := "com.squeng"
organizationName := "Squeng AG"
organizationHomepage := Some(url("https://io.squeng.com/"))

homepage := Some(url("https://squawg.com"))
startYear := Some(2021)
description := "répondez s'il vous plaît"
licenses += "MIT" -> url("https://choosealicense.com/licenses/mit/")

version := "MVP"

lazy val root = (project in file("."))
    .enablePlugins(PlayScala)
// https://www.playframework.com/documentation/latest/SBTSubProjects#Adding-a-simple-library-sub-project
    .aggregate(reinraum)
    .dependsOn(reinraum)
lazy val reinraum = project

scalaVersion := "2.13.8"

libraryDependencies += guice
libraryDependencies += "com.google.inject" % "guice" % "5.0.1" // bumping the Guice version manually allows for using Play 2.8 with Java 17
libraryDependencies += ws
libraryDependencies += "org.mongodb.scala" %% "mongo-scala-driver" % "4.4.1"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "0.22.0" % Test

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.squeng.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.squeng.binders._"
