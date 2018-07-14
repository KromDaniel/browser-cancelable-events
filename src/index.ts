import CancelableEvents from "./lib/CancelableEvents";
import CancelledPromiseError from "./lib/CancelledPromiseError";

export default CancelableEvents;

export const isCancelledPromiseError = (err: Error) => {
    return CancelledPromiseError.isCancelledPromiseError(err);
};
