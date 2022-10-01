import { AlertListener } from "./AlertListener";
import { KeyActionEvent, KeyActionEventReceiver } from "../key-binding-manager/KeyActionEventReceiver";
export declare class AlertManager implements KeyActionEventReceiver {
    private static _instance;
    private alertDiv;
    private alertTitle;
    private alertContent;
    private cancelButton;
    private confirmButton;
    private closeButton;
    private context;
    private listener;
    private constructor();
    static getInstance(): AlertManager;
    keyActionEvent(event: KeyActionEvent): void;
    startAlert(listener: AlertListener, title: string, content: string, context?: any): void;
    protected hide(): void;
    protected show(): void;
    protected confirmHandler(event: MouseEvent | null): void;
    protected cancelHandler(event: MouseEvent | null): void;
}
