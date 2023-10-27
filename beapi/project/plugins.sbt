addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.9.0")

// https://github.com/sbt/sbt/issues/6997#issue-1332853454
ThisBuild / libraryDependencySchemes ++= Seq(
  "org.scala-lang.modules" %% "scala-xml" % VersionScheme.Always
)
