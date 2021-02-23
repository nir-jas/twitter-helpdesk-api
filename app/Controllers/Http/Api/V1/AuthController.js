"use strict";
const Twitter = use("Twitter");
const Event = use("Event");
const { validate } = use("Validator");

const User = use("App/Models/User");

class AuthController {
	async getRequestToken({ request, response }) {
		try {
			response.jsend(
				await Twitter.getRequestToken(),
				"Successfully Requested"
			);
			return;
		} catch (error) {
			console.log(error);
			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}

	async getAccessToken({ request, response, auth }) {
		try {
			const params = request.all();
			const rules = {
				oauth_token: "required",
				oauth_verifier: "required",
			};

			const validation = await validate(params, rules);

			if (validation.fails()) {
				response.jsend(validation.messages(), "Bad Request", 422);
				return;
			}

			let accessToken = await Twitter.getAccessToken(
				params.oauth_token,
				params.oauth_verifier
			);

			accessToken = Object.fromEntries(new URLSearchParams(accessToken));

			let twitterUser = await Twitter.verifyCredentials(
				accessToken.oauth_token,
				accessToken.oauth_token_secret
			);
			console.log(twitterUser)

			let user = await User.findBy("provider_id", twitterUser.id_str);

			if (!user) {
				user = await User.create({
					name: twitterUser.name || "User",
					profile_image_url:
						twitterUser.profile_image_url_https || null,
					screen_name: twitterUser.screen_name || null,
					provider_id: twitterUser.id_str,
					provider: "twitter",
					oauth_token: accessToken.oauth_token,
					oauth_token_secret: accessToken.oauth_token_secret,
					account_created_at: twitterUser.created_at,
				});

				Event.fire("new::user", user.toJSON());
			} else {
				user.merge({
					name: twitterUser.name || "User",
					profile_image_url:
						twitterUser.profile_image_url_https || null,
					screen_name: twitterUser.screen_name || null,
					oauth_token: accessToken.oauth_token,
					oauth_token_secret: accessToken.oauth_token_secret,
				});

				await user.save();
			}
			
			Event.fire("new::user", user.toJSON());
			let token = await auth.withRefreshToken().generate(user);

			response.jsend(
				{ ...{ user: user }, ...token },
				"Successfully Requested"
			);
		} catch (error) {
			console.log(error);
			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}

	async getUser({ request, response, auth }) {
		try {
			response.jsend(await auth.getUser(), "Successfully Requested");
			return;
		} catch (error) {
			console.log(error);
			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}

	async refreshToken({ request, response, auth }) {
		try {
			const refreshToken = request.input("refresh_token");

			response.jsend(
				await auth
					.newRefreshToken()
					.generateForRefreshToken(refreshToken),
				"Successfully Requested"
			);
			return;
		} catch (error) {
			console.log(error);
			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}

	async logout({ request, response, auth }) {
		try {
			const token = auth.getAuthHeader();
			await auth.authenticator("jwt").revokeTokens([token]);
			response.jsend(null, "Successfully Requested");
			return;
		} catch (error) {
			console.log(error);
			response.jsend(null, "Something Went Wrong", 500);
			return;
		}
	}
}

module.exports = AuthController;
