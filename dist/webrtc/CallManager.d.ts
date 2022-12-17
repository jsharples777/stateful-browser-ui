import { Call } from "./Call";
export declare class CallManager {
    private static _instance;
    static getInstance(): CallManager;
    private constructor();
    createCall(username: string, containerId: string): Call;
}
