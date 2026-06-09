@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MAVEN_PROJECTBASEDIR=%~dp0")
@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
@SET DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

@IF NOT "%MVNW_VERBOSE%"=="" (
  @ECHO Using Maven Wrapper JAR: %WRAPPER_JAR%
)

@SET JAVA_HOME_CANDIDATE=C:\Program Files\Java\jdk-23
@IF EXIST "%JAVA_HOME_CANDIDATE%\bin\java.exe" SET "JAVA_HOME=%JAVA_HOME_CANDIDATE%"
@IF "%JAVA_HOME%"=="" SET "JAVA_HOME=C:\Program Files\Common Files\Oracle\Java\javapath"

@SET JAVA_EXE="%JAVA_HOME%\bin\java.exe"
@IF NOT EXIST %JAVA_EXE% SET JAVA_EXE="java"

%JAVA_EXE% -jar %WRAPPER_JAR% %WRAPPER_LAUNCHER% %*
