"use strict";

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use("Env");

module.exports = {
	api_key: Env.getOrFail("TWITTER_API_KEY"),
	api_secret: Env.getOrFail("TWITTER_API_SECRET"),
	api_url: Env.get("TWITTER_API_URL", "https://api.twitter.com"),
	callback_url: Env.get("TWITTER_CALLBACK_URL"),
	webhook_id: Env.get("TWITTER_WEBHOOK_ID"),
	webhook_url: Env.get("TWITTER_WEBHOOK_URL"),
	environment: Env.get("TWITTER_WEBHOOK_ENV"),
	access_token: Env.get("TWITTER_ACCESS_TOKEN"),
	access_token_secret: Env.get("TWITTER_ACCESS_TOKEN_SECRET"),
};
