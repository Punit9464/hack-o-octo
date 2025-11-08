import store from './main.js';

function deleteSession(mobile) {
    if(store.has(mobile)) {
        store.delete(mobile);
    }
    return;
}

export default deleteSession;