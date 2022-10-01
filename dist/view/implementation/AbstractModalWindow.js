import debug from 'debug';
import { KeyBindingManager } from "../../key-binding-manager/KeyBindingManager";
import { DEFAULT_KEYBINDINGS_ACTION_NAMES } from "../../ConfigurationTypes";
const logger = debug('abstract-modal-window');
export class AbstractModalWindow {
    constructor(config) {
        this.config = config;
        this.modalDiv = document.getElementById(config.modalId);
        this.title = document.getElementById(config.titleId);
        this.cancelButton = document.getElementById(config.cancelId);
        this.submitButton = document.getElementById(config.submitId);
        this.closeButton = document.getElementById(config.closeId);
        this.cancelHandler = this.cancelHandler.bind(this);
        this.cancelled = this.cancelled.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);
        this.keyActionEvent = this.keyActionEvent.bind(this);
        const keyBindingConfig = {
            contextName: config.contextName,
            receiver: this,
            keyBindings: [
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Enter',
                    actionName: DEFAULT_KEYBINDINGS_ACTION_NAMES.ok
                },
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'NumpadEnter',
                    actionName: DEFAULT_KEYBINDINGS_ACTION_NAMES.ok
                },
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Escape',
                    actionName: DEFAULT_KEYBINDINGS_ACTION_NAMES.cancel
                }
            ]
        };
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);
        this.submitButton.addEventListener('click', this.confirmHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
        this.closeButton.addEventListener('click', this.cancelHandler);
    }
    keyActionEvent(event) {
        switch (event.actionName) {
            case DEFAULT_KEYBINDINGS_ACTION_NAMES.ok: {
                this.confirmHandler(null);
                break;
            }
            case DEFAULT_KEYBINDINGS_ACTION_NAMES.cancel: {
                this.cancelHandler(null);
                break;
            }
        }
    }
    show() {
        // @ts-ignore
        this.modalDiv.classList.remove(AbstractModalWindow.hideClass);
        // @ts-ignore
        this.modalDiv.classList.add(AbstractModalWindow.showClass);
        KeyBindingManager.getInstance().activateContext(this.config.contextName);
    }
    hide() {
        KeyBindingManager.getInstance().deactivateContext(this.config.contextName);
        this.modalDiv.classList.add(AbstractModalWindow.hideClass);
        this.modalDiv.classList.remove(AbstractModalWindow.showClass);
    }
    cancelled() { }
    confirmHandler(event) {
        if (event)
            event.preventDefault();
        logger(`Handling submit event for ${this.config.contextName}`);
        if (this.validateUserInput()) {
            this.hide();
            this.completeAction();
        }
    }
    cancelHandler(event) {
        if (event)
            event.preventDefault();
        logger(`Handling cancel event from ${this.config.contextName}`);
        this.cancelled();
        this.hide();
    }
}
AbstractModalWindow.hideClass = "d-none";
AbstractModalWindow.showClass = "d-block";
//# sourceMappingURL=AbstractModalWindow.js.map