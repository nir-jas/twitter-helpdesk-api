"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.group(() => {
	Route.get("/twitter/request_token", "AuthController.getRequestToken");
	Route.get("/twitter/access_token", "AuthController.getAccessToken");
})
	.namespace("Api/V1")
	.prefix("api/v1");

Route.group(() => {
	Route.get("/auth/user", "AuthController.getUser");
	Route.post("/auth/refresh", "AuthController.refreshToken");
	Route.post("/auth/logout", "AuthController.logout");
	Route.get("/tweets/mentioned", "TweetController.getMentionedTweets")
	Route.get("/tweets/:id/replies", "TweetController.getTweetReplies")
	Route.post("/tweets", "TweetController.postTweet")
})
	.middleware(["auth"])
	.namespace("Api/V1")
	.prefix("api/v1");

Route.group(() => {
	Route.get("/twitter", "WebhookController.challenge");
	Route.post("/twitter", "WebhookController.userEvent");
})
	.namespace("Api/V1")
	.prefix("api/v1/webhooks");
