import { CollectionFilter, StateManager } from "browser-state-management";
import { Form } from "../form/Form";
import { SimpleValueDataSource } from "../helper/SimpleValueDataSource";
export declare type labelGenerator = (item: any) => string;
export declare type valueGenerator = (item: any) => string;
export declare type eventHandler = (label: string, value: string) => void;
export declare type FastSearchConfig = {
    linkedForm?: Form;
    linkedFormFieldId?: string;
    linkedElementId?: string;
    sourceState: string;
    sourceStateManager: StateManager;
    sourceStateFilter?: CollectionFilter;
    labelGenerator: labelGenerator;
    valueGenerator: valueGenerator;
    minLength: number;
    eventHandler: eventHandler;
};
export declare class FastSearchHelper {
    static addNewDataSourceToSelectElement(element: HTMLSelectElement, source: SimpleValueDataSource): void;
    static addNewFastSearch(config: FastSearchConfig): void;
}
