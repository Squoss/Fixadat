addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.2")

// https://github.com/sbt/sbt/issues/6997#issue-1332853454
ThisBuild / libraryDependencySchemes ++= Seq(
  "org.scala-lang.modules" %% "scala-xml" % VersionScheme.Always
)
