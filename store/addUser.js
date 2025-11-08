import store from "./main.js";

function initSession(mobile) {
    if(store.has(mobile)) {
        return;
    }
    const context = [];
    store.set(mobile, context);
}

export default initSession;