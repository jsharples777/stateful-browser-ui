export declare type KeyActionEventConfig = {
    actionName: string;
    controlKeyRequired: boolean;
    altKeyRequired: boolean;
    shiftKeyRequired: boolean;
    metaKeyRequired: boolean;
    keyCode: string;
    receiver?: KeyActionEventReceiver;
    contextName?: string;
};
export declare type KeyActionReceiverConfig = {
    contextName: string;
    receiver?: KeyActionEventReceiver;
    keyBindings: KeyActionEventConfig[];
};
export declare type KeyActionEvent = {
    actionName: string;
    contextName: string;
};
export interface KeyActionEventReceiver {
    keyActionEvent(event: KeyActionEvent): void;
}
