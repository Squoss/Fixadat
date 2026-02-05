/*
 * The MIT License
 *
 * Copyright (c) 2021-2026 Squeng AG
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

import { Repository } from "./driven_ports/Repository";
import { SubscriptionChannels } from "./value_objects/SubscriptionChannels";
import { Visibility } from "./value_objects/Visibility";
import { Vote } from "./value_objects/Vote";

export type ElectionData = {
  id: number;
  organizerToken: string;
  voterToken: string;
  name: string;
  description?: string;
  timeZone?: string;
  candidates: Array<string>;
  visibility: Visibility;
  created: Date;
  updated: Date;
  votes: Array<Vote>;
  subscriptions: SubscriptionChannels;
};

export class ElectionEntity {
  private readonly repository: Repository;

  id: number;
  organizerToken: string;
  voterToken: string;
  name: string;
  description?: string;
  timeZone?: string;
  candidates: Array<string>;
  visibility: Visibility;
  created: Date;
  updated: Date;
  votes: Array<Vote>;
  subscriptions: SubscriptionChannels;

  constructor(repository: Repository, data: ElectionData) {
    this.repository = repository;
    this.id = data.id;
    this.organizerToken = data.organizerToken;
    this.voterToken = data.voterToken;
    this.name = data.name;
    this.description = data.description;
    this.timeZone = data.timeZone;
    this.candidates = data.candidates;
    this.visibility = data.visibility;
    this.created = data.created;
    this.updated = data.updated;
    this.votes = data.votes;
    this.subscriptions = data.subscriptions;
  }

  updateElectionText(token: string, name: string, description?: string): Promise<void> {
    return this.repository.putElectionText(String(this.id), token, name, description);
  }

  with(overrides: Partial<ElectionData>): ElectionEntity {
    return new ElectionEntity(this.repository, {
      id: this.id,
      organizerToken: this.organizerToken,
      voterToken: this.voterToken,
      name: this.name,
      description: this.description,
      timeZone: this.timeZone,
      candidates: this.candidates,
      visibility: this.visibility,
      created: this.created,
      updated: this.updated,
      votes: this.votes,
      subscriptions: this.subscriptions,
      ...overrides,
    });
  }
}
