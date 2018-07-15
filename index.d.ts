export declare const isCancelledPromiseError: (err: Error) => boolean;
export interface ICancelablePromise<T> extends Promise<T> {
    cancel: () => void;
}
export declare class CancelableEvents {
    static isCancelledPromiseError: (err: Error) => boolean;
    private isDead;
    private timeouts;
    private intervals;
    private cancelableEvents;
    /**
     * Call to invalidate all listeners
     * After calling this method, the instance is cancelled and can't add new listeners
     */
    cancelAll(): void;
    /**
     *
     * @param handler
     * @param timeout
     * @param args
     * Same as window.setTimeout
     */
    setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): {
        cancel: () => void;
    };
    /**
     *
     * @param handler
     * @param timer
     * @param args
     * Same as window.setInterval
     */
    setInterval(handler: (...args: any[]) => void, timer?: number, ...args: any[]): {
        cancel: () => void;
    };
    /**
     *
     * @param item object with cancel method
     * @param callableKey key of the object, value must be function, this function will be called when cancelling
     */
    addCustomCancelable<T>(item: T, callableKey: keyof T): {
        cancel: () => void;
    };
    /**
     *
     * @param type
     * @param listener
     * same as window.addEventListener
     */
    addWindowEventListener<K extends keyof WindowEventMap>(type: K, listener: (ev: WindowEventMap[K]) => any): {
        cancel: () => void;
    };
    /**
     *
     * @param type
     * @param listener
     * Same as document.addEventListener
     */
    addDocumentEventListener<K extends keyof DocumentEventMap>(type: K, listener: (ev: DocumentEventMap[K]) => any): {
        cancel: () => void;
    };
    /**
     *
     * @param handler
     * @param args
     * Add promise, handler should actually return a promise
     */
    promise<T>(handler: ((...args: any[]) => Promise<T>) | Promise<T>, ...args: any[]): ICancelablePromise<T>;
    private onTimeoutCB;
    private createCancelTimeoutCB;
    private createCancelIntervalCb;
    private assertIsDead;
}
