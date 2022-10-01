import debug from 'debug';
import {
    KeyActionEvent,
    KeyActionEventReceiver,
    KeyActionReceiverConfig
} from "../../key-binding-manager/KeyActionEventReceiver";
import {KeyBindingManager} from "../../key-binding-manager/KeyBindingManager";
import {DEFAULT_KEYBINDINGS_ACTION_NAMES} from "../../ConfigurationTypes";

const logger = debug('abstract-modal-window');

export type ModalWindowConfig = {
    modalId: string,
    titleId: string,
    cancelId: string,
    submitId: string,
    closeId: string,
    contextName: string,
}

export abstract class AbstractModalWindow implements KeyActionEventReceiver {
    public static hideClass = "d-none";
    public static showClass = "d-block";
    protected modalDiv: HTMLDivElement;
    protected title: HTMLHeadingElement;
    protected cancelButton: HTMLButtonElement;
    protected submitButton: HTMLButtonElement;
    protected closeButton: HTMLButtonElement;
    protected config: ModalWindowConfig;

    public constructor(config: ModalWindowConfig) {
        this.config = config;

        this.modalDiv = <HTMLDivElement>document.getElementById(config.modalId);
        this.title = <HTMLHeadingElement>document.getElementById(config.titleId);
        this.cancelButton = <HTMLButtonElement>document.getElementById(config.cancelId);
        this.submitButton = <HTMLButtonElement>document.getElementById(config.submitId);
        this.closeButton = <HTMLButtonElement>document.getElementById(config.closeId);

        this.cancelHandler = this.cancelHandler.bind(this);
        this.cancelled = this.cancelled.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);
        this.keyActionEvent = this.keyActionEvent.bind(this);

        const keyBindingConfig: KeyActionReceiverConfig = {
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
        }
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);
        this.submitButton.addEventListener('click', this.confirmHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
        this.closeButton.addEventListener('click', this.cancelHandler);

    }

    keyActionEvent(event: KeyActionEvent): void {

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


    protected show() {
        // @ts-ignore
        this.modalDiv.classList.remove(AbstractModalWindow.hideClass);
        // @ts-ignore
        this.modalDiv.classList.add(AbstractModalWindow.showClass);
        KeyBindingManager.getInstance().activateContext(this.config.contextName);

    }

    protected hide() {
        KeyBindingManager.getInstance().deactivateContext(this.config.contextName);
        this.modalDiv.classList.add(AbstractModalWindow.hideClass);
        this.modalDiv.classList.remove(AbstractModalWindow.showClass);
    }

    protected abstract validateUserInput(): boolean;

    protected abstract completeAction(): void;

    protected cancelled():void {}

    protected confirmHandler(event: Event|null) {
        if (event) event.preventDefault();
        logger(`Handling submit event for ${this.config.contextName}`);

        if (this.validateUserInput()) {
            this.hide();
            this.completeAction();
        }
    }

    protected cancelHandler(event: MouseEvent|null) {
        if (event) event.preventDefault();
        logger(`Handling cancel event from ${this.config.contextName}`);
        this.cancelled();
        this.hide();
    }

}
