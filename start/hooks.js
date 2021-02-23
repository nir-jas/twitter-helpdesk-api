const { hooks } = require("@adonisjs/ignitor");

hooks.after.providersBooted(() => {
	const Response = use("Adonis/Src/Response");

	Response.macro("jsend", function(data = null, message = null, code = 200, status = "success") {
		if (code >= 200 && code < 300) {
			status = "success";
		} else if (code >= 400 && code < 500) {
			status = "fail";
		} else if (code >= 500) {
			status = "error";
		}

		return this.status(code).json({
			status: status,
			message: message,
			data: data
		});
	});
});
