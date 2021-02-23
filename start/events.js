"use strict";

const Event = use("Event");

Event.on("new::user", "User.registerWebhook");
Event.on("tweet::created", "Tweet.created");
