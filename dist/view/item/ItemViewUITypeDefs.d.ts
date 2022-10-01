import { BasicButtonElement, BasicElement, ElementLocation, FieldGroup } from "../../CommonTypes";
export declare type ItemViewUIDefinition = {
    id: string;
    displayName: string;
    classes?: string;
    unsavedChanges?: BasicElement;
    fieldGroups: FieldGroup[];
    buttonsContainedBy?: BasicElement;
    deleteButton?: BasicButtonElement;
    cancelButton?: BasicButtonElement;
    saveButton?: BasicButtonElement;
    activeSave?: string;
    buttonPosition?: ElementLocation;
    autoscrollOnNewContent: boolean;
    autoSave: boolean;
};
