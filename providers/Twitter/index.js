"use strict";

const axios = require("axios");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const qs = require("qs");
const Twit = require("twit");

class Twitter {
	constructor(Config) {
		this.Config = Config;
		axios.defaults.baseURL = Config.get("twitter.api_url");
		this.bearerToken = null;
		this.twit = new Twit({
			consumer_key: this.Config.get("twitter.api_key"),
			consumer_secret: this.Config.get("twitter.api_secret"),
			access_token: this.Config.get("twitter.access_token"),
			access_token_secret: this.Config.get("twitter.access_token_secret"),
		});
	}

	getOAuthHeader(requestData, token = null) {
		const oauth = OAuth({
			consumer: {
				key: this.Config.get("twitter.api_key"),
				secret: this.Config.get("twitter.api_secret"),
			},
			signature_method: "HMAC-SHA1",
			hash_function(base_string, key) {
				return crypto
					.createHmac("sha1", key)
					.update(base_string)
					.digest("base64");
			},
		});
		let oauthData = token
			? oauth.authorize(requestData, token)
			: oauth.authorize(requestData);

		return oauth.toHeader(oauthData);
	}

	getBearerToken() {
		if (this.bearerToken) return this.bearerToken;
		try {
			return new Promise((resolve, reject) => {
				axios
					.post(
						"/oauth2/token",
						qs.stringify({ grant_type: "client_credentials" }),
						{
							auth: {
								username: this.Config.get("twitter.api_key"),
								password: this.Config.get("twitter.api_secret"),
							},
							headers: {
								"Content-Type":
									"application/x-www-form-urlencoded;charset=UTF-8",
							},
						}
					)
					.then((response) => {
						this.bearerToken = response.data.access_token;
						resolve(response.data.access_token);
					})
					.catch((error) => {
						console.log(error.response.data);
						reject(error);
					});
			});
		} catch (error) {
			console.log(error);
		}
	}

	getRequestToken() {
		try {
			return new Promise((resolve, reject) => {
				axios
					.post("/oauth/request_token", "", {
						headers: this.getOAuthHeader({
							url: `${this.Config.get(
								"twitter.api_url"
							)}/oauth/request_token`,
							method: "POST",
							data: "",
						}),
					})
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						console.log(error.response.data);
						reject(error);
					});
			});
		} catch (error) {
			console.log(error);
		}
	}

	getAccessToken(token, verifier) {
		try {
			return new Promise((resolve, reject) => {
				axios
					.post("/oauth/access_token", "", {
						params: {
							oauth_token: token,
							oauth_verifier: verifier,
						},
					})
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						reject(error);
					});
			});
		} catch (error) {}
	}

	verifyCredentials(oauthToken, oauthSecret) {
		try {
			return new Promise((resolve, reject) => {
				axios
					.get("/1.1/account/verify_credentials.json", {
						headers: this.getOAuthHeader(
							{
								url: `${this.Config.get(
									"twitter.api_url"
								)}/1.1/account/verify_credentials.json`,
								method: "GET",
							},
							{
								key: oauthToken,
								secret: oauthSecret,
							}
						),
					})
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						reject(error);
					});
			});
		} catch (error) {}
	}

	generateHMAC(crcToken) {
		return crypto
			.createHmac("sha256", this.Config.get("twitter.api_secret"))
			.update(crcToken)
			.digest("base64");
	}

	registerWebhook() {
		try {
			return new Promise((resolve, reject) => {
				let apiUrl = `/1.1/account_activity/all/${this.Config.get(
					"twitter.environment"
				)}/webhooks.json?url=${encodeURIComponent(
					this.Config.get("twitter.webhook_url")
				)}`;
				axios
					.post(apiUrl, "", {
						headers: this.getOAuthHeader(
							{
								url: `${this.Config.get(
									"twitter.api_url"
								)}${apiUrl}`,
								method: "POST",
								data: "",
							},
							{
								key: this.Config.get("twitter.access_token"),
								secret: this.Config.get(
									"twitter.access_token_secret"
								),
							}
						),
					})
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						console.log(error.response.data);
						reject(error);
					});
			});
		} catch (error) {
			console.log(error);
		}
	}

	subscribrUserEvents(oauthToken, oauthSecret) {
		try {
			return new Promise((resolve, reject) => {
				let apiUrl = `/1.1/account_activity/all/${this.Config.get(
					"twitter.environment"
				)}/subscriptions.json`;
				axios({
					method: "post",
					url: apiUrl,
					headers: this.getOAuthHeader(
						{
							url: `${this.Config.get(
								"twitter.api_url"
							)}${apiUrl}`,
							method: "POST",
						},
						{
							key: oauthToken,
							secret: oauthSecret,
						}
					),
				})
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						console.log(error.response);
						reject(error.response.data);
					});
			});
		} catch (error) {
			console.log(error);
		}
	}

	getMentionedTweets(oauthToken, oauthSecret) {
		try {
			return new Promise(async (resolve, reject) => {
				axios({
					url: `/1.1/statuses/mentions_timeline.json`,
					headers: this.getOAuthHeader(
						{
							url: `${this.Config.get(
								"twitter.api_url"
							)}/1.1/statuses/mentions_timeline.json?count=200`,
							method: "GET",
						},
						{
							key: oauthToken,
							secret: oauthSecret,
						}
					),
					params: {
						count: 200,
					},
				})
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						reject(error);
					});
			});
		} catch (error) {
			console.log(error.response.data);
		}
	}

	getTweetReplies(tweetId) {
		try {
			return new Promise(async (resolve, reject) => {
				axios({
					url: `/2/tweets/search/recent`,
					headers: {
						Authorization: `Bearer ${await this.getBearerToken()}`,
					},
					params: {
						query: encodeURI(`conversation_id:${tweetId}`),
						since_id: tweetId,
						expansions:
							"attachments.media_keys,author_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id",
						"media.fields":
							"duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics",
						"tweet.fields":
							"attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,public_metrics,reply_settings,source,text,withheld",
						"user.fields": "id,name,profile_image_url,url,username",
						max_results: 100,
					},
				})
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						reject(error);
					});
			});
		} catch (error) {
			console.log(error.response.data);
		}
	}

	postTweet(status, oauthToken, oauthSecret, replyToTweetId = null) {
		return new Promise((resolve, reject) => {
			let apiUrl = `/1.1/statuses/update.json?status=${encodeURIComponent(
				status
			)}`;

			if (replyToTweetId)
				apiUrl = apiUrl + `&in_reply_to_status_id=${replyToTweetId}`;

			axios({
				method: "post",
				url: apiUrl,
				headers: this.getOAuthHeader(
					{
						url: `${this.Config.get("twitter.api_url")}${apiUrl}`,
						method: "POST",
					},
					{
						key: oauthToken,
						secret: oauthSecret,
					}
				),
			})
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					console.log(error.response);
					reject(error.response.data);
				});
		});
	}
}

module.exports = Twitter;
