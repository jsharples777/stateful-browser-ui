import { FieldValueOptions, FieldValueOptionsListener, ValueOption } from "browser-state-management";
export declare class SimpleValueDataSource implements FieldValueOptions {
    private options;
    private listeners;
    constructor(options: ValueOption[]);
    addValueOption(name: string, value: string): void;
    addListener(listener: FieldValueOptionsListener): void;
    getOptions(): ValueOption[];
    protected clearValueOptions(): void;
    protected informListeners(): void;
}
