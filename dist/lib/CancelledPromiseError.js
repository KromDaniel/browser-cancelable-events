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
Object.defineProperty(exports, "__esModule", { value: true });
var _a;
"use strict";
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
exports.default = CancelledPromiseError;
