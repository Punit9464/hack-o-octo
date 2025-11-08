import store from "./main.js";

function initSession(mobile) {
    const context = [];
    store.set(mobile, context);
}

export default initSession;