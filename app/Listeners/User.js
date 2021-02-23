"use strict";

const Twitter = use("Twitter");

const User = (exports = module.exports = {});

User.registerWebhook = async (user) => {
	await Twitter.subscribrUserEvents(
		user.oauth_token,
		user.oauth_token_secret
	);
};
