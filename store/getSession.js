import store from "./main.js";

function getSession(mobile) {
    if(store.has(mobile)) {
        return store.get(mobile);
    }
    return null;
}

export default getSession;