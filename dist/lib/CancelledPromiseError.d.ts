declare const errorSymbol: unique symbol;
export default class CancelledPromiseError extends Error {
    static isCancelledPromiseError(err: any): err is CancelledPromiseError;
    private [errorSymbol];
    constructor(message?: string);
}
export {};
