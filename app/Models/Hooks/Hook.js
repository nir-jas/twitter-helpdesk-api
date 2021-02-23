"use strict";

const { v4: uuid } = require("uuid");

const Hook = (exports = module.exports = {});

Hook.generateUUID = async (instance) => {
	instance.uuid = uuid();
};
