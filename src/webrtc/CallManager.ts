
import debug from 'debug';
import {Call} from "./Call";


const callLogger = debug('call-manager');

export class CallManager {
    private static _instance: CallManager;


    public static getInstance(): CallManager {
        if (!(CallManager._instance)) {
            CallManager._instance = new CallManager();
        }
        return CallManager._instance;
    }

    private constructor() {
    }

    public createCall(username:string,containerId:string,displayName:string,port:number):Call {
        const call = new Call(username,displayName);
        call.preForCall(containerId,port);
        return call;
    }



}
