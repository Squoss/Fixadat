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
    .aggregate(hexagon)
    .dependsOn(hexagon)
lazy val hexagon = project

scalaVersion := "3.3.7"

libraryDependencies += guice
libraryDependencies += ws
libraryDependencies += "org.mongodb" % "mongodb-driver-reactivestreams" % "5.6.2"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.2" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "1.4.1" % Test

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.squeng.controllers._"

libraryDependencies += "org.webjars.npm" % "popperjs__core" % "2.11.8"
libraryDependencies += "org.webjars.npm" % "bootstrap" % "5.3.8"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.squeng.binders._"
