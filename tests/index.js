// let's mock a browser first

global.window = {
    setTimeout: global.setTimeout,
    setInterval: global.setInterval,
};
const assert = require("assert");
const {
    promisify
} = require("util");
const cancelable = require("../dist/index");
const setTimeoutPromise = promisify(setTimeout);

const CancelableEvents = cancelable.default;
const {
    isCancelledPromiseError
} = cancelable;

describe("basic tests on promise", function () {
    it("should throw cancelled promise using cancelable.cancelAll()", function (done) {
        const cancelable = new CancelableEvents();
        const promise = cancelable.promise(() => setTimeoutPromise(50));
        promise.then(() => {
            done(new Error("resolved but should have been rejected"));
        }).catch((err) => {
            done(isCancelledPromiseError(err) ? null : `resolved error is not cancelable ${err.message}`);
        });
        cancelable.cancelAll();
    });

    it("should throw cancelled promise using promise.cancel()", function (done) {
        const cancelable = new CancelableEvents();
        const promise = cancelable.promise(() => setTimeoutPromise(50));
        promise.then(() => {
            done(new Error("resolved but should have been rejected"));
        }).catch((err) => {
            done(isCancelledPromiseError(err) ? null : `resolved error is not cancelable ${err.message}`);
        });
        promise.cancel();
    });

    it("should just resolve", function (done) {
        const cancelable = new CancelableEvents();
        const promise = cancelable.promise(() => {
            return new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
        });
        promise.then(done, done);
    });

    it("should resolve before timeout using cancelable.cancelAll()", function (done) {
        let isTimeoutOver = false;
        const cancelable = new CancelableEvents();

        cancelable.setTimeout(() => {
            isTimeoutOver = true;
        }, 10);

        setTimeout(() => {
            assert.equal(isTimeoutOver, false);
            done();
        }, 40);

        cancelable.cancelAll();
    });

    it("should resolve before timeout using timer.cancel()", function (done) {
        let isTimeoutOver = false;
        const cancelable = new CancelableEvents();

        const timer = cancelable.setTimeout(() => {
            isTimeoutOver = true;
        }, 10);

        setTimeout(() => {
            assert.equal(isTimeoutOver, false);
            done();
        }, 40);

        timer.cancel();
    });
});