import debug from 'debug';
const logger = debug('macro-evaluator');
const loggerDetail = debug('macro-evaluator:detail');
export class MacroEvaluator {
    constructor() {
        this.suppliers = [];
        this.macros = [];
        this.stateManager = undefined;
        this.customEvaluators = [];
        this.processValueForMacros = this.processValueForMacros.bind(this);
    }
    static getInstance() {
        if (!(MacroEvaluator._instance)) {
            MacroEvaluator._instance = new MacroEvaluator();
        }
        return MacroEvaluator._instance;
    }
    setSupplyingStateManagerAndName(name, stateManager) {
        this.stateManager = stateManager;
        this.stateManager.addChangeListenerForName(name, this);
    }
    addContextSupplier(name, supplier) {
        logger(`Adding context supplier for ${name}`);
        this.suppliers.push({ name, supplier });
    }
    addCustomEvaluator(macroName, evaluator) {
        this.customEvaluators.push({ macro: macroName, customEvaluator: evaluator });
    }
    addMacro(macro) {
        logger(`Adding macro`);
        logger(macro);
        this.macros.push(macro);
    }
    evaluate(macro, value, foundPosition) {
        logger(`Evaluating macro ${macro.macro}, is evaluated? ${macro.isEvaluated}`);
        let result = {
            replaceWith: '',
            macroMatchLength: 0
        };
        if (macro) {
            if (macro.isEvaluated) {
                // is there a custom evaluator?
                const foundIndex = this.customEvaluators.findIndex((evaluator) => evaluator.macro === macro.macro);
                if (foundIndex < 0) {
                    // find the context name from the macro
                    if (macro.macro.startsWith('@', 0)) { //test
                        const regex = new RegExp(`${macro.macro}\\.([a-zA-Z0-9]+(\\.)?)+`);
                        const contentFromFoundPosition = value.substr(foundPosition);
                        const evaluationMatches = contentFromFoundPosition.match(regex);
                        if (evaluationMatches) {
                            const evaluationString = evaluationMatches[0].trim();
                            // split the string with dot notation
                            const substrings = evaluationString.split('.');
                            const context = substrings[0].substr(1);
                            // can we find the context
                            loggerDetail(`Looking for context ${context}`);
                            const foundIndex = this.suppliers.findIndex((value) => value.name === context);
                            if (foundIndex >= 0) {
                                loggerDetail(`Found context ${context} supplier`);
                                const supplier = this.suppliers[foundIndex].supplier;
                                const contextObject = supplier.getContextObjectForName(context);
                                if (contextObject) {
                                    loggerDetail(`Context value found - evaluating expression`);
                                    let done = false;
                                    let evalCompleted = false;
                                    let index = 1;
                                    let value = contextObject;
                                    while (!done) {
                                        if (index < substrings.length) {
                                            const fieldId = substrings[index];
                                            if (!this.fieldIsKeyword(fieldId)) {
                                                // get the value of the field
                                                value = value[fieldId];
                                                if (value) {
                                                    loggerDetail(`Found field ${fieldId} of previous value`);
                                                    index++;
                                                }
                                                else {
                                                    done = true;
                                                }
                                            }
                                            else {
                                                value = this.evaluateKeyword(value, fieldId);
                                                if (value) {
                                                    loggerDetail(`Found keyword ${fieldId} of previous value`);
                                                    index++;
                                                }
                                                else {
                                                    done = true;
                                                }
                                            }
                                        }
                                        else {
                                            done = true;
                                            evalCompleted = true;
                                        }
                                    }
                                    if (evalCompleted) {
                                        loggerDetail(`Completed expression with value ${value}`);
                                        result.replaceWith = value + '';
                                        result.macroMatchLength = evaluationMatches[0].length;
                                    }
                                    else {
                                        loggerDetail(`Unable to compute expression ${evaluationMatches[0]}, has missing fields`);
                                        result.replaceWith = '';
                                        result.macroMatchLength = evaluationMatches[0].length;
                                    }
                                }
                            }
                        }
                        else {
                            if (evaluationMatches)
                                loggerDetail(`Unable to compute expression ${evaluationMatches[0]}, has missing fields`);
                            result.replaceWith = '';
                            result.macroMatchLength = macro.macro.length;
                        }
                    }
                }
                else {
                    const evaluator = this.customEvaluators[foundIndex];
                    result = evaluator.customEvaluator(macro);
                }
            }
            else {
                result.replaceWith = macro.replaceWith;
                result.macroMatchLength = macro.replaceWith.length;
            }
        }
        return result;
    }
    addInputField(field) {
        try {
            const element = field.getElement();
            element.addEventListener('keyup', (event) => {
                if (event.isComposing || event.keyCode === 229) {
                    return;
                }
                if (event.key) {
                    if ((event.key === 'Tab') || (event.key === "Enter") || (event.key === 'Space')) {
                        // @ts-ignore
                        logger(`Checking for macros for field ${field.getName()} with value ${element.value}`);
                        // @ts-ignore
                        element.value = this.processValueForMacros(element.value);
                        return;
                    }
                }
                if ((event.keyCode === 32) || (event.keyCode === 13) || (event.keyCode === 9)) {
                    // @ts-ignore
                    logger(`Checking for macros for field ${field.getName()} with value ${element.value}`);
                    // @ts-ignore
                    element.value = this.processValueForMacros(element.value);
                }
            });
        }
        catch (err) {
            logger(`Unable to access input element for field ${field.getName()}`);
        }
    }
    filterResults(managerName, name, filterResults) {
    }
    foundResult(managerName, name, foundItem) {
    }
    getListenerName() {
        return "Macro Evaluator";
    }
    stateChanged(managerName, name, newValue) {
        if (newValue) {
            logger(`Loading macros`);
            this.macros = [];
            newValue.forEach((macro) => {
                this.addMacro({
                    _id: macro._id,
                    macro: macro.macro,
                    replaceWith: macro.replaceWith,
                    isEvaluated: macro.isEvaluated,
                    isSystemMacro: macro.isSystemMacro
                });
            });
        }
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
        if (this.stateManager)
            this.stateChanged(managerName, name, this.stateManager.getStateByName(name));
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
        if (this.stateManager)
            this.stateChanged(managerName, name, this.stateManager.getStateByName(name));
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
        if (this.stateManager)
            this.stateChanged(managerName, name, this.stateManager.getStateByName(name));
    }
    processHTMLContentForMacros(html) {
        return this.processValueForMacros(html);
    }
    fieldIsKeyword(field) {
        let result = false;
        if ((field === MacroEvaluator.LATEST) || (field === MacroEvaluator.EARLIEST)) {
            result = true;
        }
        return result;
    }
    evaluateKeyword(currentValue, keyword) {
        let result = null;
        switch (keyword) {
            case MacroEvaluator.LATEST: {
                const length = currentValue.length;
                result = currentValue[length - 1];
                break;
            }
            case MacroEvaluator.EARLIEST: {
                const length = currentValue.length;
                result = currentValue[0];
                break;
            }
        }
        return result;
    }
    processValueForMacros(value) {
        let result = value + '';
        // check to see if any macros apply
        const applicableMacros = [];
        // look for each macro in the new value
        if (value) {
            this.macros.forEach((macro) => {
                if (value.includes(macro.macro)) {
                    loggerDetail(`Found macro ${macro.macro}`);
                    applicableMacros.push(macro);
                }
            });
            applicableMacros.forEach((macro) => {
                let foundPosition = 0;
                foundPosition = result.indexOf(macro.macro, foundPosition);
                while (foundPosition >= 0) {
                    const replaceWith = this.evaluate(macro, result, foundPosition);
                    // remove the macro from the value and replace with the replaceWith variable content
                    if (foundPosition > 0) {
                        result = result.substr(0, foundPosition) + replaceWith.replaceWith + result.substr(foundPosition + replaceWith.macroMatchLength);
                    }
                    else if (foundPosition === 0) {
                        result = replaceWith.replaceWith + result.substr(foundPosition + replaceWith.macroMatchLength);
                    }
                    loggerDetail(`Applying macro ${macro.macro} at position ${foundPosition}, value is now ${result}`);
                    foundPosition = result.indexOf(macro.macro, foundPosition);
                }
            });
        }
        return result;
    }
    itemNotModified(managerName, name, item) {
    }
}
MacroEvaluator.LATEST = 'LATEST';
MacroEvaluator.EARLIEST = 'EARLIEST';
//# sourceMappingURL=MacroEvaluator.js.map