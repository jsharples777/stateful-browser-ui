import { KeyActionEvent, KeyActionEventReceiver } from "../../key-binding-manager/KeyActionEventReceiver";
export declare type ModalWindowConfig = {
    modalId: string;
    titleId: string;
    cancelId: string;
    submitId: string;
    closeId: string;
    contextName: string;
};
export declare abstract class AbstractModalWindow implements KeyActionEventReceiver {
    static hideClass: string;
    static showClass: string;
    protected modalDiv: HTMLDivElement;
    protected title: HTMLHeadingElement;
    protected cancelButton: HTMLButtonElement;
    protected submitButton: HTMLButtonElement;
    protected closeButton: HTMLButtonElement;
    protected config: ModalWindowConfig;
    constructor(config: ModalWindowConfig);
    keyActionEvent(event: KeyActionEvent): void;
    protected show(): void;
    protected hide(): void;
    protected abstract validateUserInput(): boolean;
    protected abstract completeAction(): void;
    protected cancelled(): void;
    protected confirmHandler(event: Event | null): void;
    protected cancelHandler(event: MouseEvent | null): void;
}
