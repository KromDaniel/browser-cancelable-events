// let's mock a browser first

global.window = {
    setTimeout: global.setTimeout,
    setInterval: global.setInterval,
};
const assert = require("assert");
const {
    promisify
} = require("util");
const {
    CancelableEvents,
    isCancelledPromiseError
} = require("../index");
const setTimeoutPromise = promisify(setTimeout);

describe("check error is isCancelledPromiseError", function () {
    it("should not recognize errors as cancelled promise error", function () {
        assert.equal(isCancelledPromiseError(new Error()), false);
        const error = new Error();
        error[Symbol()] = true;
        assert.equal(isCancelledPromiseError(error), false);
    });
})
describe("basic tests", function () {
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

    it("should invoke cancel immediately", function () {
        const cancelable = new CancelableEvents();
        let isFlaggedByPromise = false;
        const promise = cancelable.promise(new Promise(async (resolve, reject) => {
            await setTimeoutPromise(0);
            isFlaggedByPromise = true;
        }));

        const chained = promise.then(() => {
            throw new Error("shouldn't resolve");
        }).catch((err) => {
            assert.equal(isCancelledPromiseError(err), true);
            assert.equal(isFlaggedByPromise, false);
        });

        promise.cancel();

        return chained;
    })

    it("should just resolve", function (done) {
        const cancelable = new CancelableEvents();
        const promise = cancelable.promise(() => {
            return new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
        });
        promise.then(done, done);
    });

    it("should accept Promise instance and resolve", function (done) {
        const cancelable = new CancelableEvents();
        cancelable.promise(setTimeoutPromise(100)).then(done, done);
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