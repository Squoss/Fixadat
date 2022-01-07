scalaVersion := "2.13.7"

libraryDependencies += guice
libraryDependencies += "com.googlecode.libphonenumber" % "libphonenumber" % "8.12.40"
libraryDependencies += "commons-validator" % "commons-validator" % "1.7"

libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.10" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "0.22.0" % Test
