import { KeyActionEvent, KeyActionEventConfig, KeyActionEventReceiver, KeyActionReceiverConfig } from "./KeyActionEventReceiver";
import { DocumentLoaded } from "browser-state-management";
export declare class KeyBindingManager implements DocumentLoaded, KeyActionEventReceiver {
    static CONTEXT_Default: string;
    private static _instance;
    private defaultContextBinding;
    private currentContextBinding;
    private contextBindings;
    private contextStack;
    private constructor();
    static getInstance(): KeyBindingManager;
    onDocumentLoaded(): void;
    handleKeyBinding(event: KeyboardEvent): void;
    setDefaultKeyBindings(defaultContextBinding: KeyActionReceiverConfig): void;
    addContextKeyBindings(contextBinding: KeyActionReceiverConfig): void;
    activateContext(contextName: string): void;
    deactivateContext(contextName: string): void;
    keyActionEvent(event: KeyActionEvent): void;
    protected resetToDefaultBindings(): void;
    protected isSameKeyBinding(keyBinding1: KeyActionEventConfig, keyBinding2: KeyActionEventConfig): boolean;
    protected combineBindings(startingBinding: KeyActionReceiverConfig, addOrReplaceWithBinding: KeyActionReceiverConfig): KeyActionEventConfig[];
    protected addContextToStackAndKeyBindings(keyBinding: KeyActionReceiverConfig): void;
    protected getKeyBindingForContext(contextName: string): KeyActionReceiverConfig | null;
    protected removeContextFromStackAndKeyBindings(contextName: string): void;
}
