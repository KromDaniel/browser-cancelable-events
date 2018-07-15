"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a;
"use strict";
// tslint:disable:max-classes-per-file
exports.isCancelledPromiseError = function (err) {
    return CancelledPromiseError.isCancelledPromiseError(err);
};
var isPromise = function (p) {
    return p instanceof Promise;
};
var errorSymbol = Symbol();
var CancelledPromiseError = /** @class */ (function (_super) {
    __extends(CancelledPromiseError, _super);
    function CancelledPromiseError(message) {
        if (message === void 0) { message = "Promise was cancelled"; }
        var _this = _super.call(this, message) || this;
        _this[_a] = true;
        return _this;
    }
    CancelledPromiseError.isCancelledPromiseError = function (err) {
        return err[errorSymbol] === true;
    };
    return CancelledPromiseError;
}(Error));
_a = errorSymbol;
var CancelableEvents = /** @class */ (function () {
    function CancelableEvents() {
        var _this = this;
        this.isDead = false;
        this.timeouts = new Set();
        this.intervals = new Set();
        this.cancelableEvents = new Set();
        this.onTimeoutCB = function (handler) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            handler.apply(void 0, args);
        };
        this.createCancelTimeoutCB = function (timeoutId) { return function () {
            clearTimeout(timeoutId);
            _this.timeouts.delete(timeoutId);
        }; };
        this.createCancelIntervalCb = function (intervalId) { return function () {
            clearInterval(intervalId);
            _this.intervals.delete(intervalId);
        }; };
    }
    /**
     * Call to invalidate all listeners
     * After calling this method, the instance is cancelled and can't add new listeners
     */
    CancelableEvents.prototype.cancelAll = function () {
        var _this = this;
        Array.from(this.timeouts).forEach(function (c) {
            _this.createCancelTimeoutCB(c)();
        });
        Array.from(this.intervals).forEach(function (c) {
            _this.createCancelIntervalCb(c)();
        });
        Array.from(this.cancelableEvents).forEach(function (c) { return c(); });
        this.isDead = true;
    };
    /**
     *
     * @param handler
     * @param timeout
     * @param args
     * Same as window.setTimeout
     */
    CancelableEvents.prototype.setTimeout = function (handler, timeout) {
        if (timeout === void 0) { timeout = 0; }
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.assertIsDead();
        var timeoutId = setTimeout(this.onTimeoutCB, timeout, handler);
        this.timeouts.add(timeoutId);
        var cancel = this.createCancelTimeoutCB(timeoutId);
        return { cancel: cancel };
    };
    /**
     *
     * @param handler
     * @param timer
     * @param args
     * Same as window.setInterval
     */
    CancelableEvents.prototype.setInterval = function (handler, timer) {
        if (timer === void 0) { timer = 0; }
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.assertIsDead();
        var intervalId = setInterval.apply(void 0, [handler, timer].concat(args));
        this.intervals.add(intervalId); // avoid nodeJs.timer and window.
        var cancel = this.createCancelIntervalCb(intervalId);
        return { cancel: cancel };
    };
    /**
     *
     * @param item object with cancel method
     * @param callableKey key of the object, value must be function, this function will be called when cancelling
     */
    CancelableEvents.prototype.addCustomCancelable = function (item, callableKey) {
        var _this = this;
        this.assertIsDead();
        var cb = item[callableKey];
        if (!isFunction(cb)) {
            throw new Error("key " + callableKey + " is not a function but " + typeof item[callableKey]);
        }
        var cancel = function () {
            cb();
            _this.cancelableEvents.delete(cancel);
        };
        this.cancelableEvents.add(cancel);
        return { cancel: cancel };
    };
    /**
     *
     * @param type
     * @param listener
     * same as window.addEventListener
     */
    CancelableEvents.prototype.addWindowEventListener = function (type, listener) {
        var _this = this;
        this.assertIsDead();
        var cb = function (ev) {
            return listener(ev);
        };
        var cancel = function () {
            window.removeEventListener(type, cb);
            _this.cancelableEvents.delete(cancel);
        };
        this.cancelableEvents.add(cancel);
        window.addEventListener(type, cb);
        return { cancel: cancel };
    };
    /**
     *
     * @param type
     * @param listener
     * Same as document.addEventListener
     */
    // tslint:disable-next-line:max-line-length
    CancelableEvents.prototype.addDocumentEventListener = function (type, listener) {
        var _this = this;
        this.assertIsDead();
        var cb = function (ev) {
            return listener(ev);
        };
        var cancel = function () {
            document.removeEventListener(type, cb);
            _this.cancelableEvents.delete(cancel);
        };
        this.cancelableEvents.add(cancel);
        document.addEventListener(type, cb);
        return { cancel: cancel };
    };
    /**
     *
     * @param handler
     * @param args
     * Add promise, handler should actually return a promise
     */
    CancelableEvents.prototype.promise = function (handler) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.assertIsDead();
        var isCanceled = false;
        var cancel = function () {
            isCanceled = true;
            _this.cancelableEvents.delete(cancel);
        };
        this.cancelableEvents.add(cancel);
        var promise = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (isPromise(handler) ? handler : handler.apply(void 0, args))];
                    case 1:
                        res = _a.sent();
                        if (isCanceled) {
                            reject(new CancelledPromiseError());
                            return [2 /*return*/];
                        }
                        resolve(res);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        reject(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        promise.cancel = cancel;
        return promise;
    };
    CancelableEvents.prototype.assertIsDead = function () {
        if (this.isDead) {
            throw new Error("Can't add listener to cancelled instance");
        }
    };
    CancelableEvents.isCancelledPromiseError = function (err) {
        return CancelledPromiseError.isCancelledPromiseError(err);
    };
    return CancelableEvents;
}());
exports.CancelableEvents = CancelableEvents;
var isFunction = function (t) {
    return "function" === typeof t;
};
