"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserSchema extends Schema {
	up() {
		this.create("users", (table) => {
			table.increments();
			table.uuid("uuid", 36).unique().notNullable();
			table.string("name").nullable();
			table.string("profile_image_url").nullable();
			table.string("screen_name").nullable();
			table.string("email", 254).nullable().unique();
			table.string("provider_id").notNullable();
			table.string("provider").notNullable();
			table.string("password", 60).nullable();
			table.string("oauth_token").nullable();
			table.string("oauth_token_secret").nullable();
			table.string("account_created_at").nullable();
			table.timestamps();
		});
	}

	down() {
		this.drop("users");
	}
}

module.exports = UserSchema;
