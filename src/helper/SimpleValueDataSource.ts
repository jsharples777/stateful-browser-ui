import {FieldValueOptions, FieldValueOptionsListener, ValueOption} from "browser-state-management";

export class SimpleValueDataSource implements FieldValueOptions { // static value list
    private options: ValueOption[];
    private listeners: FieldValueOptionsListener[];

    constructor(options: ValueOption[]) {
        this.options = options;
        this.listeners = [];
    }

    public addValueOption(name: string, value: string) {
        this.options.push({name, value});
    }

    addListener(listener: FieldValueOptionsListener): void {
        this.listeners.push(listener);
    }

    getOptions(): ValueOption[] {
        return this.options;
    }

    protected clearValueOptions() {
        this.options = [];
        this.informListeners();
    }

    protected informListeners() {
        this.listeners.forEach((listener) => listener.optionsChanged(this.options));
    }

}
