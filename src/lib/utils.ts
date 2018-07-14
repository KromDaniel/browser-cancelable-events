export const isFunction = (t: any): t is () => void => {
    return "function" === typeof t;
};
