import { Attribute, ConditionalField, FieldDefinition, FieldEditor, FieldFormatter, FieldRenderer, FieldValidator, FieldValueOptions, UndefinedBoolean } from "browser-state-management";
export declare enum ElementLocation {
    top = 0,
    bottom = 1,
    left = 2,
    right = 3,
    none = -1
}
export declare type ExtraAction = {
    name: string;
    button: BasicButtonElement;
    confirm: boolean;
};
export declare enum FieldLabelPosition {
    aboveField = 0,
    inlineWithField = 1,
    noLabel = 2
}
export declare type FieldRuntimeConfig = {
    fieldId: string;
    elementClasses?: string;
    containedBy?: BasicElement;
    fieldDimensions?: {
        columnSpan: number;
        spacingClasses?: string;
    };
    label?: {
        label?: string;
        labelPosition: FieldLabelPosition;
    };
    editor?: FieldEditor;
    renderer?: FieldRenderer;
    validator?: FieldValidator;
    extraActions?: ExtraAction[];
    fieldIsEditableInTable?: UndefinedBoolean;
};
export declare enum UIFieldType {
    checkbox = 0,
    email = 1,
    hidden = 2,
    number = 3,
    password = 4,
    text = 5,
    textarea = 6,
    select = 7,
    radioGroup = 8,
    tableData = 9,
    list = 10,
    composite = 11,
    linked = 12,
    linkedList = 13
}
export declare type FieldLabel = {
    label: string;
    attributes?: Attribute[];
    classes?: string;
};
export declare type DescriptionText = {
    message: string;
    elementType: string;
    elementClasses: string;
};
export declare type rendererFn = (fieldUIConfig: FieldUIConfig, value: string) => string;
export declare const defaultGetValue: rendererFn;
export declare type FieldUIConfig = {
    field: FieldDefinition;
    displayOrder: number;
    elementType: UIFieldType;
    elementAttributes?: Attribute[];
    elementClasses?: string;
    subElement?: {
        container?: BasicElement;
        label?: FieldLabel;
        element: BasicElement;
    };
    label?: FieldLabel;
    describedBy?: DescriptionText;
    containedBy?: BasicElement;
    textarea?: {
        rows: number;
        cols: number;
    };
    extraActions?: ExtraAction[];
    validator?: {
        validator: FieldValidator;
        messageDisplay?: BasicElement;
        validClasses?: string;
        invalidClasses?: string;
    };
    renderer?: FieldRenderer;
    editor?: FieldEditor;
    formatter?: FieldFormatter;
    conditionalDisplay?: ConditionalField;
    datasource?: FieldValueOptions;
    getValue: rendererFn;
};
export declare type FieldGroup = {
    containedBy?: BasicElement;
    subGroups?: FieldGroup[];
    fields: FieldUIConfig[];
};
export declare type FieldRuntimeGroup = {
    containedBy?: BasicElement;
    subGroups?: FieldRuntimeGroup[];
    fields: string[];
};
export declare type AttributeFieldMapItem = {
    fieldId: string;
    attributeId: string;
};
export declare type ModifierClasses = {
    normal: string;
    inactive: string;
    active: string;
    warning: string;
};
export declare type IconClasses = {
    normal: string;
    inactive?: string;
    active?: string;
    warning?: string;
};
export declare type BasicButtonElement = {
    classes: string;
    text?: string;
    iconClasses?: string;
    attributes?: Attribute[];
};
export declare type BasicElement = {
    type: string;
    attributes?: Attribute[];
    classes: string;
    innerHTML?: string;
};
export declare const DRAGGABLE_KEY_ID: string;
export declare const DRAGGABLE_TYPE: string;
export declare const DRAGGABLE_FROM: string;
export declare type Draggable = {
    type: string;
    from: string;
};
export declare type Droppable = {
    acceptTypes: string[];
    acceptFrom?: string[];
};
export declare enum ItemEventType {
    SHOWN = "shown",
    HIDDEN = "hidden",
    CANCELLING = "cancelling",
    CANCELLING_ABORTED = "cancelling-aborted",
    CANCELLED = "cancelled",
    SAVING = "saving",
    SAVE_ABORTED = "save-aborted",
    SAVED = "saved",
    DELETING = "deleting",
    DELETE_ABORTED = "delete-aborted",
    DELETED = "deleted",
    CREATING = "creating",
    MODIFYING = "modifying",
    DISPLAYING_READ_ONLY = "readonly",
    RESETTING = "reset",
    COMPOSITE_EDIT = "composite-edit",
    COMPOSITE_ARRAY_EDIT = "composite-array-edit",
    LINKED_EDIT = "linked-edit",
    LINKED_ARRAY_EDIT = "linked-array-edit",
    FIELD_ACTION = "field-action"
}
export declare enum BasicKeyAction {
    ok = "OK",
    cancel = "Cancel"
}
