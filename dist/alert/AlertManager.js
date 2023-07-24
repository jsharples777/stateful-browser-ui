import { AlertType } from "./AlertListener";
import debug from 'debug';
import { KeyBindingManager } from "../key-binding-manager/KeyBindingManager";
import { BasicKeyAction } from "../CommonTypes";
const ALERT_MODAL_ID = 'alert';
const ALERT_TITLE = 'alert-title';
const ALERT_CONTENT = 'alert-content';
const ALERT_CANCEL = 'alert-cancel';
const ALERT_CONFRIM = 'alert-confirm';
const ALERT_CLOSE = 'alert-close';
const ALERT_hideClass = "d-none";
const ALERT_showClass = "d-block";
const logger = debug('alert');
export class AlertManager {
    constructor() {
        this.alertDiv = document.getElementById(ALERT_MODAL_ID);
        this.alertTitle = document.getElementById(ALERT_TITLE);
        this.alertContent = document.getElementById(ALERT_CONTENT);
        this.cancelButton = document.getElementById(ALERT_CANCEL);
        this.confirmButton = document.getElementById(ALERT_CONFRIM);
        this.closeButton = document.getElementById(ALERT_CLOSE);
        this.startAlert = this.startAlert.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);
        this.cancelHandler = this.cancelHandler.bind(this);
        this.keyActionEvent = this.keyActionEvent.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        const keyBindingConfig = {
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
                    keyCode: 'NumpadEnter',
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
        };
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);
        this.confirmButton.addEventListener('click', this.confirmHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
        this.closeButton.addEventListener('click', this.cancelHandler);
    }
    static getInstance() {
        if (!(AlertManager._instance)) {
            AlertManager._instance = new AlertManager();
        }
        return AlertManager._instance;
    }
    keyActionEvent(event) {
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
    startAlert(listener, title, content, context) {
        this.alertTitle.innerHTML = title;
        this.alertContent.innerHTML = content;
        this.show();
        this.listener = listener;
        this.context = context;
    }
    hide() {
        this.alertDiv.classList.remove(ALERT_showClass);
        this.alertDiv.classList.add(ALERT_hideClass);
        KeyBindingManager.getInstance().deactivateContext('Alert');
    }
    show() {
        this.alertDiv.classList.remove(ALERT_hideClass);
        this.alertDiv.classList.add(ALERT_showClass);
        KeyBindingManager.getInstance().activateContext('Alert');
    }
    confirmHandler(event) {
        logger(`Handling confirm event from alert`);
        this.listener.alertCompleted({ outcome: AlertType.confirmed, context: this.context });
        this.hide();
    }
    cancelHandler(event) {
        logger(`Handling cancel event from alert`);
        this.listener.alertCompleted({ outcome: AlertType.cancelled, context: this.context });
        this.hide();
    }
}
//# sourceMappingURL=AlertManager.js.map