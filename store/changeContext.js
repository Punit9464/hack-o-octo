import store from "./main.js";

function changeContext(mobile, newContext) {
    if(store.has(mobile)) {
        const prevContext = store.get(mobile);
        store.set(mobile, [...prevContext, newContext]);
    }
    return;
}

export default changeContext;