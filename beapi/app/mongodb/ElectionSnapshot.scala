/*
 * The MIT License
 *
 * Copyright (c) 2021-2022 Squeng AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package mongodb

import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.entity_interfaces.ElectionT
import domain.value_objects.AccessToken
import domain.value_objects.EmailAddress
import domain.value_objects.Id
import domain.value_objects.Visibility._
import domain.value_objects.Vote

import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.util.Locale
import java.util.TimeZone

case class ElectionSnapshot(
    id: Id,
    created: Instant,
    updated: Instant,
    organizerToken: AccessToken,
    voterToken: AccessToken,
    name: String,
    description: Option[String],
    timeZone: Option[TimeZone],
    candidates: Set[LocalDateTime],
    votes: Seq[Vote],
    visibility: Visibility,
    subscriptions: (
        Locale,
        Option[EmailAddress],
        Option[PhoneNumber],
        Option[URL]
    ),
    replayedEvents: Int
) extends ElectionT
