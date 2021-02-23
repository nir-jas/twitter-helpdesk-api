"use strict";
const Twitter = use("Twitter");
const Logger = use("Logger");
const Event = use("Event");

class WebhookController {
	async challenge({ request, response }) {
		try {
			let token = await Twitter.generateHMAC(request.input("crc_token"));
			response.json({
				response_token: `sha256=${token}`,
			});
		} catch (error) {
			Logger.error("CRC Challenge Webhook Error \n", error);

			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}

	async userEvent({ request, response }) {
		try {
			let event = request.all();
			let eventNames = Object.keys(event);

			if (eventNames.includes("tweet_create_events")) {
				Event.fire("tweet::created", event);
			}

			response.jsend(null, "Successfully Requested");
			return;
		} catch (error) {
			Logger.error("UserEvent Webhook Error \n", error);

			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}
}

module.exports = WebhookController;
