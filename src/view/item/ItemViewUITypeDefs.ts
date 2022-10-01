import {BasicButtonElement, BasicElement, ElementLocation, FieldGroup} from "../../CommonTypes";


export type ItemViewUIDefinition = {
    id: string,
    displayName: string,
    classes?: string,
    unsavedChanges?: BasicElement,
    fieldGroups: FieldGroup[],
    buttonsContainedBy?: BasicElement
    deleteButton?: BasicButtonElement,// should be clickable
    cancelButton?: BasicButtonElement,// should be clickable
    saveButton?: BasicButtonElement  // should be clickable
    activeSave?: string,
    buttonPosition?: ElementLocation,
    autoscrollOnNewContent: boolean,
    autoSave: boolean
}














