export class SimpleValueDataSource {
    constructor(options) {
        this.options = options;
        this.listeners = [];
    }
    addValueOption(name, value) {
        this.options.push({ name, value });
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    getOptions() {
        return this.options;
    }
    clearValueOptions() {
        this.options = [];
        this.informListeners();
    }
    informListeners() {
        this.listeners.forEach((listener) => listener.optionsChanged(this.options));
    }
}
//# sourceMappingURL=SimpleValueDataSource.js.map