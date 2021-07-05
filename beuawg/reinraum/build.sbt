scalaVersion := "2.13.6"

libraryDependencies += guice
libraryDependencies += "com.googlecode.libphonenumber" % "libphonenumber" % "8.12.26"
libraryDependencies += "commons-validator" % "commons-validator" % "1.7"

libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.9" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "0.20.0" % Test
