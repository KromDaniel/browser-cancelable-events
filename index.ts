
// tslint:disable:max-classes-per-file
export const isCancelledPromiseError = (err: Error) => {
    return CancelledPromiseError.isCancelledPromiseError(err);
};

export interface ICancelablePromise<T> extends Promise<T> {
    cancel: () => void;
}

const errorSymbol = Symbol();
class CancelledPromiseError extends Error {
    public static isCancelledPromiseError(err: any): err is CancelledPromiseError {
        return err[errorSymbol] === true;
    }
    private [errorSymbol] = true;
    constructor(message: string = "Promise was cancelled") {
        super(message);
    }
}

export class CancelableEvents {
    public static isCancelledPromiseError = (err: Error) => {
        return CancelledPromiseError.isCancelledPromiseError(err);
    }
    private isDead: boolean = false;
    private timeouts: Set<number> = new Set();
    private intervals: Set<number> = new Set();
    private cancelableEvents: Set<() => void> = new Set();

    /**
     * Call to invalidate all listeners
     * After calling this method, the instance is cancelled and can't add new listeners
     */
    public cancelAll() {
        Array.from(this.timeouts).forEach((c) => {
            this.createCancelTimeoutCB(c)();
        });
        Array.from(this.intervals).forEach((c) => {
            this.createCancelIntervalCb(c)();
        });
        Array.from(this.cancelableEvents).forEach((c) => c());
        this.isDead = true;
    }

    /**
     *
     * @param handler
     * @param timeout
     * @param args
     * Same as window.setTimeout
     */
    public setTimeout(handler: (...args: any[]) => void, timeout: number = 0, ...args: any[]) {
        this.assertIsDead();
        const timeoutId: number = setTimeout(this.onTimeoutCB, timeout, handler) as any;
        this.timeouts.add(timeoutId);
        const cancel = this.createCancelTimeoutCB(timeoutId);
        return { cancel };
    }

    /**
     *
     * @param handler
     * @param timer
     * @param args
     * Same as window.setInterval
     */
    public setInterval(handler: (...args: any[]) => void, timer: number = 0, ...args: any[]) {
        this.assertIsDead();
        const intervalId: number = setInterval(handler, timer, ...args) as any;
        this.intervals.add(intervalId); // avoid nodeJs.timer and window.
        const cancel = this.createCancelIntervalCb(intervalId);
        return { cancel };
    }

    /**
     *
     * @param item object with cancel method
     * @param callableKey key of the object, value must be function, this function will be called when cancelling
     */
    public addCustomCancelable<T>(item: T, callableKey: keyof T) {
        this.assertIsDead();
        const cb = item[callableKey];
        if (!isFunction(cb)) {
            throw new Error(`key ${callableKey} is not a function but ${typeof item[callableKey]}`);
        }
        const cancel = () => {
            cb();
            this.cancelableEvents.delete(cancel);
        };

        this.cancelableEvents.add(cancel);

        return { cancel };
    }

    /**
     *
     * @param type
     * @param listener
     * same as window.addEventListener
     */
    public addWindowEventListener<K extends keyof WindowEventMap>(type: K, listener: (ev: WindowEventMap[K]) => any) {
        this.assertIsDead();
        const cb = (ev: WindowEventMap[K]) => {
            return listener(ev);
        };

        const cancel = () => {
            window.removeEventListener(type, cb);
            this.cancelableEvents.delete(cancel);
        };
        this.cancelableEvents.add(cancel);
        window.addEventListener(type, cb);

        return { cancel };
    }

    /**
     *
     * @param type
     * @param listener
     * Same as document.addEventListener
     */
    public addDocumentListener<K extends keyof DocumentEventMap>(type: K, listener: (ev: DocumentEventMap[K]) => any) {
        this.assertIsDead();
        const cb = (ev: DocumentEventMap[K]) => {
            return listener(ev);
        };
        const cancel = () => {
            document.removeEventListener(type, cb);
            this.cancelableEvents.delete(cancel);
        };
        this.cancelableEvents.add(cancel);
        document.addEventListener(type, cb);

        return { cancel };
    }

    /**
     *
     * @param handler
     * @param args
     * Add promise, handler should actually return a promise
     */
    public promise<T>(handler: (...args: any[]) => Promise<T>, ...args: any[]): ICancelablePromise<T> {
        this.assertIsDead();
        let isCanceled = false;
        const cancel = () => {
            isCanceled = true;
            this.cancelableEvents.delete(cancel);
        };
        this.cancelableEvents.add(cancel);
        const promise = new Promise<T>(async (resolve, reject) => {
            try {
                const res: T = await handler(...args);
                if (isCanceled) {
                    reject(new CancelledPromiseError());
                    return;
                }
                resolve(res);

            } catch (err) {
                reject(err);
            }
        });
        (promise as ICancelablePromise<T>).cancel = cancel;
        return (promise as ICancelablePromise<T>);
    }
    private onTimeoutCB = (handler: (...args: any[]) => void, ...args: any[]) => {
        handler(...args);
    }

    private createCancelTimeoutCB = (timeoutId: number) => () => {
        clearTimeout(timeoutId);
        this.timeouts.delete(timeoutId);
    }

    private createCancelIntervalCb = (intervalId: number) => () => {
        clearInterval(intervalId);
        this.intervals.delete(intervalId);
    }

    private assertIsDead() {
        if (this.isDead) {
            throw new Error("Can't add listener to cancelled instance");
        }
    }
}

const isFunction = (t: any): t is () => void => {
    return "function" === typeof t;
};
