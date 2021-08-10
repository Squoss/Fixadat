package thirdparty_services

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.Phonenumber
import domain.value_objects.EmailAddress
import play.api.Configuration
import play.api.Logging
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.libs.ws.WSRequest
import play.api.libs.ws.WSResponse
import thirdparty_apis.Email
import thirdparty_apis.Sms

import javax.inject.Inject
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import play.api.libs.ws.WSAuthScheme
import play.api.libs.json.JsArray
import play.api.libs.json.JsObject

// e912366272ef460895bbcb8673fa04ea
class Mailjet @Inject() (implicit
    ec: ExecutionContext,
    config: Configuration,
    val ws: WSClient
) extends Email
    with Sms
    with Logging {

  // https://dev.mailjet.com/email/guides/#authentication
  val username = config.get[String]("mailjet.apiKey")
  val password = config.get[String]("mailjet.apiSecretKey")
  // https://dev.mailjet.com/sms/guides/send-sms-api/#authentication
  val smsToken = config.get[String]("mailjet.smsToken")

  // https://dev.mailjet.com/email/guides/send-api-v31/#send-a-basic-email
  val emailUrl = "https://api.mailjet.com/v3.1/send"
  // https://dev.mailjet.com/sms/guides/send-sms-api/#send-transactional-sms
  val smsUrl = "https://api.mailjet.com/v4/sms-send"

  override def send(
      to: EmailAddress,
      subject: String,
      plainText: String
  ): Future[Unit] = {

    val data = Json.obj(
      "Messages" -> Json.arr(
        Json.obj(
          "From" -> Json.obj(
            "Email" -> "squawg@squeng.com",
            "Name" -> "Squawg"
          ),
          "To" -> Json.arr(
            Json.obj(
              "Email" -> to.wert
            )
          ),
          "Subject" -> subject,
          "TextPart" -> plainText
        )
      )
    )

    val responseFuture: Future[WSResponse] = ws
      .url(emailUrl)
      .withAuth(username, password, WSAuthScheme.BASIC)
      .addHttpHeaders(
        "Content-Type" -> "application/json"
      )
      .post(data)

    responseFuture.map(response => {
      logger.debug(response.json("Status").toString)
    })
  }

  override def send(to: Phonenumber.PhoneNumber, text: String): Future[Unit] = {

    val data = Json.obj(
      "From" -> "Squawg",
      "To" -> PhoneNumberUtil
        .getInstance()
        .format(to, PhoneNumberUtil.PhoneNumberFormat.E164),
      "Text" -> text
    )

    val responseFuture: Future[WSResponse] =
      ws.url(smsUrl)
        .addHttpHeaders(
          "Authorization" -> s"Bearer $smsToken",
          "Content-Type" -> "application/json"
        )
        .post(data)

    responseFuture.map(response => {
      logger.debug(response.json("Status").toString)
    })
  }
}
