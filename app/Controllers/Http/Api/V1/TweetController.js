"use strict";
const Twitter = use("Twitter");
const Logger = use("Logger");
const _ = require("lodash");
const { validate } = use("Validator");

class TweetController {
	async getMentionedTweets({ response, auth }) {
		try {
			let user = await auth.getUser();
			let tweets = await Twitter.getMentionedTweets(
				user.oauth_token,
				user.oauth_token_secret
			);

			response.jsend(tweets, "Requested Successfully");
			return;
		} catch (error) {
			Logger.error("Get Mentioned Tweet API Error: \n", error);

			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}

	async getTweetReplies({ response, params }) {
		try {
			let replies = await Twitter.getTweetReplies(params.id);
			let users = [];
			let media = [];
			if (replies.meta.result_count > 0) {
				users = replies.includes.users;
				media = replies.includes.media;
				replies = _.map(replies.data, (item) => {
					item.user = _.find(users, { id: item.author_id });
					if (item.attachments && item.attachments.media_keys) {
						item.media = _.map(item.attachments.media_keys, (m) => {
							return _.find(media, { media_key: m });
						});
					}
					return item;
				});
				replies = _.reverse(replies);
			} else {
				replies = [];
			}

			response.jsend(replies, "Requested Successfully");
			return;
		} catch (error) {
			Logger.error("Get Tweet Replies API Error: \n", error);

			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}

	async postTweet({ request, response, auth }) {
		try {
			const params = request.all();
			const rules = {
				status: "required",
			};

			const validation = await validate(params, rules);

			if (validation.fails()) {
				response.jsend(validation.messages(), "Bad Request", 422);
				return;
			}

			let user = await auth.getUser();
			let post = await Twitter.postTweet(
				params.status,
				user.oauth_token,
				user.oauth_token_secret,
				params.tweet_id || null
			);
            
			response.jsend(post, "Requested Successfully");
			return;
		} catch (error) {
			Logger.error("Post Tweet API Error: \n", error);

			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}
}

module.exports = TweetController;
