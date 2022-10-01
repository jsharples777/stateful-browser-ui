import {
    KeyActionEvent,
    KeyActionEventConfig,
    KeyActionEventReceiver,
    KeyActionReceiverConfig
} from "./KeyActionEventReceiver";
import debug from 'debug';
import {copyObject, DocumentLoaded} from "browser-state-management";


const logger = debug('key-binding-manager');


export class KeyBindingManager implements DocumentLoaded, KeyActionEventReceiver {
    public static CONTEXT_Default = 'DEFAULT';
    private static _instance: KeyBindingManager;
    private defaultContextBinding: KeyActionReceiverConfig | null = null;
    private currentContextBinding: KeyActionReceiverConfig | null = null;
    private contextBindings: KeyActionReceiverConfig[] = [];
    private contextStack: string[] = [];

    private constructor() {
        this.handleKeyBinding = this.handleKeyBinding.bind(this);
    }

    public static getInstance(): KeyBindingManager {
        if (!(KeyBindingManager._instance)) {
            KeyBindingManager._instance = new KeyBindingManager();
        }
        return KeyBindingManager._instance;
    }

    onDocumentLoaded(): void {
        window.addEventListener('keyup', this.handleKeyBinding);
    }

    public handleKeyBinding(event: KeyboardEvent): void {
        const key = event.code;
        if (this.currentContextBinding) {
            let foundAllBindings = false;
            let foundIndex = -1;
            while (!foundAllBindings) {
                foundIndex = this.currentContextBinding.keyBindings.findIndex((keyBinding, index) => ((keyBinding.keyCode === key) && (index > foundIndex)));
                if (foundIndex >= 0) {
                    const binding = this.currentContextBinding.keyBindings[foundIndex];
                    if (event.altKey === binding.altKeyRequired) {
                        if (event.ctrlKey === binding.controlKeyRequired) {
                            if (event.shiftKey === binding.shiftKeyRequired) {
                                if (event.metaKey === binding.metaKeyRequired) {
                                    if (binding.receiver) {
                                        if (binding.contextName) {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            logger(`Key binding activated for context ${binding.contextName} with key ${key} and action ${binding.actionName}`);
                                            binding.receiver.keyActionEvent({
                                                actionName: binding.actionName,
                                                contextName: binding.contextName
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    foundAllBindings = true;
                }
            }
        }
    }

    public setDefaultKeyBindings(defaultContextBinding: KeyActionReceiverConfig): void {
        logger('Setting default key bindings');
        defaultContextBinding.contextName = KeyBindingManager.CONTEXT_Default;

        this.defaultContextBinding = defaultContextBinding;
        this.resetToDefaultBindings();

        this.contextStack.push(KeyBindingManager.CONTEXT_Default);
    }

    public addContextKeyBindings(contextBinding: KeyActionReceiverConfig): void {
        logger(`Adding key bindings for context ${contextBinding.contextName}`);
        contextBinding.keyBindings.forEach((keyBinding) => {
            keyBinding.contextName = contextBinding.contextName;
            keyBinding.receiver = contextBinding.receiver;
        })
        this.contextBindings.push(contextBinding);
    }

    public activateContext(contextName: string): void {
        const foundIndex = this.contextBindings.findIndex((binding) => binding.contextName === contextName);
        if (foundIndex >= 0) {
            logger(`Activating key bindings for context ${contextName}`);
            const keyBinding = this.contextBindings[foundIndex];
            this.addContextToStackAndKeyBindings(keyBinding);
            logger(`Activating key bindings for context ${contextName}, stack is now ${this.contextStack}`);
        }
    }

    public deactivateContext(contextName: string): void {
        const foundIndex = this.contextBindings.findIndex((binding) => binding.contextName === contextName);
        if (foundIndex >= 0) {
            logger(`Deactivating key bindings for context ${contextName}`);
            this.removeContextFromStackAndKeyBindings(contextName);
        }

    }

    keyActionEvent(event: KeyActionEvent): void {
    }

    protected resetToDefaultBindings(): void {
        if (this.defaultContextBinding) {
            const defaultReceiver = this.defaultContextBinding?.receiver;
            this.defaultContextBinding.receiver = undefined;

            this.currentContextBinding = copyObject(this.defaultContextBinding);
            this.defaultContextBinding.receiver = defaultReceiver;

            if (this.currentContextBinding) {
                this.currentContextBinding.receiver = defaultReceiver;

                if (this.currentContextBinding && this.defaultContextBinding) {
                    this.currentContextBinding.keyBindings.forEach((keyBinding) => {
                        // @ts-ignore
                        keyBinding.contextName = this.currentContextBinding.contextName;
                        // @ts-ignore
                        keyBinding.receiver = this.currentContextBinding.receiver;
                    })
                }
            }

        }
    }

    protected isSameKeyBinding(keyBinding1: KeyActionEventConfig, keyBinding2: KeyActionEventConfig): boolean {
        let result = false;
        if (keyBinding1.keyCode === keyBinding2.keyCode) {
            if (keyBinding1.controlKeyRequired === keyBinding2.controlKeyRequired) {
                if (keyBinding1.altKeyRequired === keyBinding2.altKeyRequired) {
                    if (keyBinding1.shiftKeyRequired === keyBinding2.shiftKeyRequired) {
                        if (keyBinding1.metaKeyRequired === keyBinding2.metaKeyRequired) {
                            result = true;
                        }
                    }
                }
            }
        }
        return result;
    }

    protected combineBindings(startingBinding: KeyActionReceiverConfig, addOrReplaceWithBinding: KeyActionReceiverConfig): KeyActionEventConfig[] {
        let results: KeyActionEventConfig[] = [];
        let usedKeyBindingsFromReplacementSet: number[] = [];

        logger(`Combining key bindings for contexts ${startingBinding.contextName} and ${addOrReplaceWithBinding.contextName}`);

        startingBinding.keyBindings.forEach((keyBinding) => {
            let index = addOrReplaceWithBinding.keyBindings.length - 1;
            let replaced = false;
            while (index >= 0) {
                let addOrReplaceWithBindingKeyBinding = addOrReplaceWithBinding.keyBindings[index];
                if (this.isSameKeyBinding(keyBinding, addOrReplaceWithBindingKeyBinding)) {
                    logger(`Context ${addOrReplaceWithBinding.contextName} key binding for key ${addOrReplaceWithBindingKeyBinding.keyCode} replacing context ${startingBinding.contextName}`);
                    replaced = true;
                    usedKeyBindingsFromReplacementSet.push(index);
                    addOrReplaceWithBindingKeyBinding.receiver = addOrReplaceWithBinding.receiver;
                    addOrReplaceWithBindingKeyBinding.contextName = addOrReplaceWithBinding.contextName;

                    results.push(addOrReplaceWithBindingKeyBinding);
                }
                index--;
            }
            if (!replaced) {
                keyBinding.receiver = startingBinding.receiver;
                keyBinding.contextName = startingBinding.contextName;
                results.push(keyBinding);
            }
        });

        //  add the unused key bindings
        addOrReplaceWithBinding.keyBindings.forEach((keyBinding, index) => {
            const foundIndex = usedKeyBindingsFromReplacementSet.findIndex((usedIndex) => usedIndex === index);
            if (foundIndex < 0) {
                let addOrReplaceWithBindingKeyBinding = addOrReplaceWithBinding.keyBindings[index];
                logger(`Adding new key binding for context ${addOrReplaceWithBinding.contextName} for key ${addOrReplaceWithBindingKeyBinding.keyCode}`);

                addOrReplaceWithBindingKeyBinding.receiver = addOrReplaceWithBinding.receiver;
                addOrReplaceWithBindingKeyBinding.contextName = addOrReplaceWithBinding.contextName;
                results.push(addOrReplaceWithBinding.keyBindings[index]);
            }
        })

        return results;
    }

    protected addContextToStackAndKeyBindings(keyBinding: KeyActionReceiverConfig): void {
        const foundIndex = this.contextStack.findIndex((item) => item === keyBinding.contextName);
        if (foundIndex < 0) {
            this.contextStack.push(keyBinding.contextName);
            if (this.currentContextBinding) {
                let newKeyBindings = this.combineBindings(this.currentContextBinding, keyBinding);
                this.currentContextBinding = {
                    keyBindings: newKeyBindings,
                    contextName: '',
                    receiver: this
                }

            }
        }
    }

    protected getKeyBindingForContext(contextName: string): KeyActionReceiverConfig | null {
        let result: KeyActionReceiverConfig | null = null;
        const foundIndex = this.contextBindings.findIndex((binding) => binding.contextName === contextName);
        if (foundIndex >= 0) {
            result = this.contextBindings[foundIndex];
        }
        return result;
    }

    protected removeContextFromStackAndKeyBindings(contextName: string): void {
        logger(`Removing key bindings for context ${contextName}`);
        const foundIndex = this.contextStack.findIndex((stackItem) => stackItem === contextName);
        if (foundIndex >= 0) {
            this.contextStack.splice(foundIndex, 1);
            logger(`Removing key bindings for context ${contextName}, stack is now ${this.contextStack} with length ${this.contextStack.length}`);

        }
        this.resetToDefaultBindings();
        if (this.contextStack.length > 1) {
            for (let index = 1; index < this.contextStack.length; index++) {
                const stackContextName = this.contextStack[index];
                const keyBinding = this.getKeyBindingForContext(stackContextName);
                if (this.currentContextBinding && keyBinding) {
                    logger(`Adding key bindings back in for context ${stackContextName}`);
                    let newKeyBindings = this.combineBindings(this.currentContextBinding, keyBinding);
                    this.currentContextBinding = {
                        keyBindings: newKeyBindings,
                        contextName: '',
                        receiver: this
                    }
                }
            }
        }

    }
}
