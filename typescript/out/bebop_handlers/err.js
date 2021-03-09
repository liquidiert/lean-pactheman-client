"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pactheman_models_1 = require("../models/pactheman.models");
class ErrorMsgHandler {
    handleMessage(sender, message) {
        message = pactheman_models_1.ErrorMsg.decode(message);
        console.log(`Received ${message.errorMessage} violation`);
    }
}
exports.default = ErrorMsgHandler;
