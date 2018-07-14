const errorSymbol = Symbol();
export default class CancelledPromiseError extends Error {
    public static isCancelledPromiseError(err: any): err is CancelledPromiseError {
        return err[errorSymbol] === true;
    }
    private [errorSymbol] = true;
    constructor(message: string = "Promise was cancelled") {
        super(message);
    }
}
