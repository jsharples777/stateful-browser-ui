import {AlertListener, AlertType} from "./AlertListener";
import debug from 'debug';
import {KeyBindingManager} from "../key-binding-manager/KeyBindingManager";
import {
    KeyActionEvent,
    KeyActionEventReceiver,
    KeyActionReceiverConfig
} from "../key-binding-manager/KeyActionEventReceiver";
import {BasicKeyAction} from "../CommonTypes";



const ALERT_MODAL_ID = 'alert';
const ALERT_TITLE = 'alert-title';
const ALERT_CONTENT = 'alert-content';
const ALERT_CANCEL = 'alert-cancel';
const ALERT_CONFRIM = 'alert-confirm';
const ALERT_CLOSE = 'alert-close';

const ALERT_hideClass = "d-none";
const ALERT_showClass = "d-block";

const logger = debug('alert');

export class AlertManager implements KeyActionEventReceiver {
    private static _instance: AlertManager;
    private alertDiv: HTMLDivElement;
    private alertTitle: HTMLHeadingElement;
    private alertContent: HTMLParagraphElement;
    private cancelButton: HTMLButtonElement;
    private confirmButton: HTMLButtonElement;
    private closeButton: HTMLButtonElement;
    private context: any;
    // @ts-ignore
    private listener: AlertListener;

    private constructor() {
        this.alertDiv = <HTMLDivElement>document.getElementById(ALERT_MODAL_ID);
        this.alertTitle = <HTMLHeadingElement>document.getElementById(ALERT_TITLE);
        this.alertContent = <HTMLParagraphElement>document.getElementById(ALERT_CONTENT);
        this.cancelButton = <HTMLButtonElement>document.getElementById(ALERT_CANCEL);
        this.confirmButton = <HTMLButtonElement>document.getElementById(ALERT_CONFRIM);
        this.closeButton = <HTMLButtonElement>document.getElementById(ALERT_CLOSE);

        this.startAlert = this.startAlert.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);
        this.cancelHandler = this.cancelHandler.bind(this);
        this.keyActionEvent = this.keyActionEvent.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);

        const keyBindingConfig: KeyActionReceiverConfig = {
            contextName: 'Alert',
            receiver: this,
            keyBindings: [
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Enter',
                    actionName: BasicKeyAction.ok
                },
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Escape',
                    actionName: BasicKeyAction.cancel
                }
            ]
        }
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);


        this.confirmButton.addEventListener('click', this.confirmHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
        this.closeButton.addEventListener('click', this.cancelHandler);
    }

    public static getInstance(): AlertManager {
        if (!(AlertManager._instance)) {
            AlertManager._instance = new AlertManager();
        }
        return AlertManager._instance;
    }

    keyActionEvent(event: KeyActionEvent): void {
        switch (event.actionName) {
            case BasicKeyAction.ok: {
                this.confirmHandler(null);
                break;
            }
            case BasicKeyAction.cancel: {
                this.cancelHandler(null);
                break;
            }
        }
    }

    public startAlert(listener: AlertListener, title: string, content: string, context?: any) {
        this.alertTitle.innerHTML = title;
        this.alertContent.innerHTML = content;
        this.show();
        this.listener = listener;
        this.context = context;
    }

    protected hide() {
        this.alertDiv.classList.remove(ALERT_showClass);
        this.alertDiv.classList.add(ALERT_hideClass);
        KeyBindingManager.getInstance().deactivateContext('Alert');
    }

    protected show() {
        this.alertDiv.classList.remove(ALERT_hideClass);
        this.alertDiv.classList.add(ALERT_showClass);
        KeyBindingManager.getInstance().activateContext('Alert');
    }

    protected confirmHandler(event: MouseEvent | null) {
        logger(`Handling confirm event from alert`);
        this.listener.alertCompleted({outcome: AlertType.confirmed, context: this.context});
        this.hide();
    }

    protected cancelHandler(event: MouseEvent | null) {
        logger(`Handling cancel event from alert`);
        this.listener.alertCompleted({outcome: AlertType.cancelled, context: this.context});
        this.hide();
    }
}
