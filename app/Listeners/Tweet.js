"use strict";

const Ws = use("Ws");

const Tweet = (exports = module.exports = {});

Tweet.created = async (event) => {
	for (let index = 0; index < event.tweet_create_events.length; index++) {
		const element = event.tweet_create_events[index];
		let topic = null;
		if (element.in_reply_to_status_id_str) {
			topic = await Ws.getChannel("twitter:*").topic(
				`twitter:${element.conversation_id}`
			);
			if (topic) {
				topic.broadcast("new:tweet:reply", element);
			}
		} else {
			topic = await Ws.getChannel("twitter:*").topic(
				`twitter:${element.in_reply_to_screen_name}`
			);
			if (topic) {
				topic.broadcast("new:tweet", element);
			}
		}
	}
};
