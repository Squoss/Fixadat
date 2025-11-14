scalaVersion := "3.3.7"

libraryDependencies += "com.google.inject" % "guice" % "6.0.0"
libraryDependencies += "com.googlecode.libphonenumber" % "libphonenumber" % "9.0.18"
libraryDependencies += "commons-validator" % "commons-validator" % "1.10.0"

// using https://scalameta.org/munit/ from the https://docs.scala-lang.org/toolkit/introduction.html#what-is-the-scala-toolkit
// previously (yes, not scalatestplus-play): libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.19" % Test
// alternative: https://github.com/com-lihaoyi/utest from the https://github.com/com-lihaoyi#the-lihaoyi-scala-platform-
libraryDependencies += "org.scalameta" %% "munit" % "1.2.1" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "1.4.1" % Test
