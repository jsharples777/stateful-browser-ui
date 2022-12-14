import debug from 'debug';
import { Call } from "./Call";
const callLogger = debug('call-manager');
export class CallManager {
    constructor() {
    }
    static getInstance() {
        if (!(CallManager._instance)) {
            CallManager._instance = new CallManager();
        }
        return CallManager._instance;
    }
    createCall(username, containerId, displayName, port) {
        const call = new Call(username, displayName);
        call.preForCall(containerId, port);
        return call;
    }
}
//# sourceMappingURL=CallManager.js.map