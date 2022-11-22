scalaVersion := "2.13.10"

libraryDependencies += "com.google.inject" % "guice" % "5.1.0"
libraryDependencies += "com.googlecode.libphonenumber" % "libphonenumber" % "8.13.0"
libraryDependencies += "commons-validator" % "commons-validator" % "1.7"

libraryDependencies += "org.apache.commons" % "commons-text" % "1.10.0"

libraryDependencies += "net.aichler" % "jupiter-interface" % JupiterKeys.jupiterVersion.value % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "1.0.0" % Test
