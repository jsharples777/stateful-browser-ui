export interface MacroContextSupplier {
    getContextObjectForName(contextObjectName: string): any;
}
