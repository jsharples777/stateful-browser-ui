import { MacroContextSupplier } from "./MacroContextSupplier";
import { Field, StateChangeListener, StateManager } from "browser-state-management";
export declare type customEvaluator = (macro: Macro) => EvaluationResult;
export declare type MacroEvaluatorConfig = {
    macro: string;
    customEvaluator: customEvaluator;
};
export declare type Macro = {
    _id: string;
    macro: string;
    replaceWith: string;
    isEvaluated: boolean;
    isSystemMacro: boolean;
};
export declare type EvaluationResult = {
    replaceWith: string;
    macroMatchLength: number;
};
export declare class MacroEvaluator implements StateChangeListener {
    static LATEST: string;
    static EARLIEST: string;
    private static _instance;
    private suppliers;
    private macros;
    private stateManager;
    private customEvaluators;
    private constructor();
    static getInstance(): MacroEvaluator;
    setSupplyingStateManagerAndName(name: string, stateManager: StateManager): void;
    addContextSupplier(name: string, supplier: MacroContextSupplier): void;
    addCustomEvaluator(macroName: string, evaluator: customEvaluator): void;
    addMacro(macro: Macro): void;
    evaluate(macro: any, value: string, foundPosition: number): EvaluationResult;
    addInputField(field: Field): void;
    filterResults(managerName: string, name: string, filterResults: any): void;
    foundResult(managerName: string, name: string, foundItem: any): void;
    getListenerName(): string;
    stateChanged(managerName: string, name: string, newValue: any): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
    processHTMLContentForMacros(html: string): string;
    protected fieldIsKeyword(field: string): boolean;
    protected evaluateKeyword(currentValue: any, keyword: string): any;
    private processValueForMacros;
    itemNotModified(managerName: string, name: string, item: any): void;
}
