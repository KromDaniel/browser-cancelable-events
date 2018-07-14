"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var CancelableEvents_1 = __importDefault(require("./lib/CancelableEvents"));
var CancelledPromiseError_1 = __importDefault(require("./lib/CancelledPromiseError"));
exports.default = CancelableEvents_1.default;
exports.isCancelledPromiseError = function (err) {
    return CancelledPromiseError_1.default.isCancelledPromiseError(err);
};
