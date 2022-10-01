

import debug from 'debug';
import {RBGFieldOperations} from "./RBGFieldOperations";


import {ColourEditor} from "./ColourEditor";
import {ItemViewConfigHelper} from "../view/item/ItemViewConfigHelper";
import {ItemViewUIDefinition} from "../view/item/ItemViewUITypeDefs";
import {
    defaultGetValue,
    FieldGroup,
    FieldLabelPosition,
    FieldRuntimeConfig,
    FieldUIConfig,
    UIFieldType
} from "../CommonTypes";
import {
    BasicFieldOperations,
    DataObjectDefinition,
    DisplayOrder,
    FIELD_CreatedOn, FIELD_ModifiedOn,
    FieldType,
    UndefinedBoolean
} from "browser-state-management";
import {DetailViewRuntimeConfig} from "../ConfigurationTypes";

const logger = debug('bootstrap-form-config-helper');


export class BootstrapFormConfigHelper implements ItemViewConfigHelper {

    public static COLOUR_PICKER_CONTAINER: string = 'framework-colour-picker-container';
    public static SLIDE_BAR_CONTAINER: string = 'framework-slider-container'

    private static _instance: BootstrapFormConfigHelper;

    private constructor() {
    }

    public static getInstance(): BootstrapFormConfigHelper {
        if (!(BootstrapFormConfigHelper._instance)) {
            BootstrapFormConfigHelper._instance = new BootstrapFormConfigHelper();
        }
        return BootstrapFormConfigHelper._instance;
    }


    generateConfig(dataObjDef: DataObjectDefinition, runtimeConfig: DetailViewRuntimeConfig): ItemViewUIDefinition {
        let fieldOperations: BasicFieldOperations = new BasicFieldOperations();
        let rbgFieldOperation: RBGFieldOperations = new RBGFieldOperations();


        // create a form with a single group and button container with Bootstrap styles
        let fieldGroup: FieldGroup = {
            containedBy: {
                type: 'div',
                classes: 'col-sm-12',
            },
            fields: []
        }

        let shouldAutoScroll = false;
        if (runtimeConfig.autoscrollOnNewContent) {
            shouldAutoScroll = (runtimeConfig.autoscrollOnNewContent === UndefinedBoolean.true);
        }
        let shouldAutoSave = false;
        if (runtimeConfig.autoSave) {
            shouldAutoSave = (runtimeConfig.autoSave === UndefinedBoolean.true);
        }

        const formConfig: ItemViewUIDefinition = {
            id: dataObjDef.id,
            displayName: dataObjDef.displayName,
            fieldGroups: [fieldGroup],
            unsavedChanges: {
                type: 'div',
                classes: 'invalid-feedback text-right col-md-12 col-lg-9 offset-lg-3',
                attributes: [{name: 'style', value: 'display:block'}],
                innerHTML: `Pending changes to ${dataObjDef.displayName}`,
            },
            buttonPosition: runtimeConfig.buttonLocation,
            autoscrollOnNewContent: shouldAutoScroll,
            autoSave: shouldAutoSave
        }


        // create the Field UI config for each field
        let fieldUIConfigs: FieldUIConfig[] = [];

        dataObjDef.fields.forEach((fieldDef, index) => {

            let fieldType: UIFieldType = UIFieldType.text;
            switch (fieldDef.type) {
                case (FieldType.time):
                case (FieldType.text):
                case (FieldType.date):
                case (FieldType.shortTime):
                case (FieldType.colour):
                case (FieldType.duration): {
                    break;
                }
                case (FieldType.datetime): {
                    // is this the created or modified date
                    if (runtimeConfig.hideModifierFields) {
                        if (fieldDef.id === FIELD_CreatedOn) {
                            fieldType = UIFieldType.hidden;
                        }
                        if (fieldDef.id === FIELD_ModifiedOn) {
                            fieldType = UIFieldType.hidden;
                        }
                    }
                    break;
                }
                case (FieldType.userId): {
                    if (runtimeConfig.hideModifierFields) {
                        fieldType = UIFieldType.hidden;
                    } else {
                        fieldType = UIFieldType.text;
                    }
                    break;
                }
                case (FieldType.uuid):
                case (FieldType.id): {
                    fieldType = UIFieldType.hidden;
                    break;
                }
                case (FieldType.integer):
                case (FieldType.float): {
                    fieldType = UIFieldType.number;
                    break;
                }
                case (FieldType.email): {
                    fieldType = UIFieldType.email;
                    break;
                }
                case (FieldType.password): {
                    fieldType = UIFieldType.password;
                    break;
                }
                case (FieldType.boolean): {
                    fieldType = UIFieldType.checkbox;
                    break;
                }
                case (FieldType.largeText): {
                    fieldType = UIFieldType.textarea;
                    break;
                }
                case (FieldType.choice): {
                    fieldType = UIFieldType.select;
                    break;
                }
                case (FieldType.limitedChoice): {
                    fieldType = UIFieldType.radioGroup;
                    break;
                }
                case (FieldType.compositeObjectArray): {
                    fieldType = UIFieldType.list;
                    break;
                }
                case (FieldType.compositeObject): {
                    fieldType = UIFieldType.composite;
                    break;
                }
                case (FieldType.linkedObject): {
                    fieldType = UIFieldType.linked;
                    break;
                }
                case (FieldType.linkedObjectArray): {
                    fieldType = UIFieldType.linkedList;
                    break;
                }
            }

            // see if the field was supplied with a display order
            const displayOrder: DisplayOrder | undefined = runtimeConfig.fieldDisplayOrders.find((value) => value.fieldId === fieldDef.id);
            let displayOrderValue: number = index;
            if (displayOrder) {
                displayOrderValue = displayOrder.displayOrder;
            }

            // construct the field ui config
            let fieldUIConfig: FieldUIConfig = {
                field: fieldDef,
                displayOrder: displayOrderValue,
                elementType: fieldType,
                elementClasses: 'form-control col-sm-9',
                renderer: fieldOperations,
                formatter: fieldOperations,
                getValue: defaultGetValue
            }

            if ((fieldDef.type !== FieldType.id) && (fieldDef.type !== FieldType.uuid) && (fieldType !== UIFieldType.hidden) && (fieldType !== UIFieldType.list) && (fieldType !== UIFieldType.composite) && (fieldType !== UIFieldType.linked) && (fieldType !== UIFieldType.linkedList)) { // no labels, descriptions, container for id,uuid
                fieldUIConfig.containedBy = {
                    type: 'div',
                    classes: 'form-group row'
                };

                fieldUIConfig.label = {
                    label: fieldDef.displayName,
                    classes: 'col-md-12 col-lg-3 col-form-label'
                };
                if (fieldDef.description) { // descriptions if the field has one
                    fieldUIConfig.describedBy = {
                        message: fieldDef.description,
                        elementType: 'small',
                        elementClasses: 'text-muted col-md-12 col-lg-9 offset-lg-3 mt-1'
                    }
                }
                if (!fieldDef.displayOnly) { // no validator for readonly items
                    fieldUIConfig.validator = {
                        validator: fieldOperations,
                        messageDisplay: {
                            type: 'div',
                            classes: 'invalid-feedback col-md-12 col-lg-9 offset-lg-3'
                        },
                        validClasses: 'is-valid',
                        invalidClasses: 'is-invalid',
                    };
                }
            }

            // text areas
            if (fieldDef.type === FieldType.largeText) {
                fieldUIConfig.textarea = {
                    rows: 5,
                    cols: 20
                }
            }
            // select
            if (fieldDef.type === FieldType.choice) { // subelements are options, with no classes, no labels, and no other container
                fieldUIConfig.subElement = {
                    element: {type: 'option', classes: ''},
                };
                fieldUIConfig.datasource = fieldDef.dataSource;
            }
            // composite object (single)
            // if (fieldDef.type === FieldType.compositeObject) { // subelements are options, with no classes, no labels, and no other container
            //     fieldUIConfig.extraActions = [
            //         {
            //             name:'Edit',
            //             button: {
            //                 classes:'btn bg-primary',
            //                 iconClasses:'fas fa-edit'
            //             },
            //             confirm:false
            //         }
            //     ]
            //     fieldUIConfig.validator = undefined;
            // }
            // // composite object (array)
            // if (fieldDef.type === FieldType.compositeObjectArray) { // subelements are options, with no classes, no labels, and no other container
            //     fieldUIConfig.subElement = {
            //         element: {
            //             type: 'li',
            //             classes: 'list-group-item'
            //         },
            //         container: {
            //             type: 'div',
            //             classes: 'form-check form-check-inline'
            //         },
            //     };
            //     fieldUIConfig.extraActions = [
            //         {
            //             name:'Edit',
            //             button: {
            //                 classes:'btn bg-primary',
            //                 iconClasses:'fas fa-edit'
            //             },
            //             confirm:false
            //         }
            //     ]
            //     fieldUIConfig.renderer = undefined;
            //     fieldUIConfig.validator = undefined;
            //     fieldUIConfig.formatter = undefined;
            // }
            // // composite object (single)
            // if (fieldDef.type === FieldType.linkedObject) { // subelements are options, with no classes, no labels, and no other container
            //     fieldUIConfig.extraActions = [
            //         {
            //             name:'Edit',
            //             button: {
            //                 classes:'btn bg-primary',
            //                 iconClasses:'fas fa-edit'
            //             },
            //             confirm:false
            //         }
            //     ]
            //     fieldUIConfig.renderer = undefined;
            //     fieldUIConfig.validator = undefined;
            //     fieldUIConfig.formatter = undefined;
            // }
            // // composite object (array)
            // if (fieldDef.type === FieldType.linkedObjectArray) { // subelements are options, with no classes, no labels, and no other container
            //     fieldUIConfig.subElement = {
            //         element: {
            //             type: 'li',
            //             classes: 'list-group-item'
            //         },
            //         container: {
            //             type: 'div',
            //             classes: 'form-check form-check-inline'
            //         },
            //     };
            //     fieldUIConfig.extraActions = [
            //         {
            //             name:'Edit',
            //             button: {
            //                 classes:'btn bg-primary',
            //                 iconClasses:'fas fa-edit'
            //             },
            //             confirm:false
            //         }
            //     ]
            //     fieldUIConfig.renderer = undefined;
            //     fieldUIConfig.validator = undefined;
            //     fieldUIConfig.formatter = undefined;
            // }
            // radio button group
            if (fieldDef.type === FieldType.limitedChoice) {
                fieldUIConfig.subElement = {
                    element: {
                        type: 'input',
                        classes: 'form-check-input',
                        attributes: [{name: 'type', value: 'radio'}]
                    },
                    container: {
                        type: 'div',
                        classes: 'form-check form-check-inline'
                    },
                    label: {
                        label: 'label',
                        classes: 'form-check-label',
                    },
                }
                fieldUIConfig.renderer = rbgFieldOperation;
                if (fieldUIConfig.validator) fieldUIConfig.validator.validator = rbgFieldOperation;
                fieldUIConfig.formatter = rbgFieldOperation;

                fieldUIConfig.datasource = fieldDef.dataSource;
            }

            if (fieldDef.type === FieldType.colour) {
                fieldUIConfig.editor = new ColourEditor(BootstrapFormConfigHelper.COLOUR_PICKER_CONTAINER);
            }

            // see if the field was supplied with a field runtime
            if (runtimeConfig.fieldRuntimeConfigs) {
                const fieldRuntime: FieldRuntimeConfig | undefined = runtimeConfig.fieldRuntimeConfigs.find((runtimeField) => runtimeField.fieldId === fieldUIConfig.field.id);
                if (fieldRuntime) {
                    if (fieldRuntime.containedBy && fieldUIConfig.containedBy) {
                        fieldUIConfig.containedBy = fieldRuntime.containedBy;
                    }
                    if (fieldRuntime.validator) {
                        if (fieldUIConfig.validator) fieldUIConfig.validator.validator = fieldRuntime.validator;
                    }
                    if (fieldRuntime.label) {
                        if (fieldRuntime.label.labelPosition === FieldLabelPosition.noLabel) {
                            fieldUIConfig.label = undefined;
                            if (fieldUIConfig.containedBy) {
                                fieldUIConfig.containedBy.classes = 'form-group row';
                            } else {
                                fieldUIConfig.elementClasses = 'form-control';
                            }
                        }
                        if (fieldRuntime.label.labelPosition === FieldLabelPosition.aboveField) {
                            if (fieldUIConfig.containedBy) {
                                fieldUIConfig.containedBy.classes = 'form-group row';
                            }
                        }
                        if (fieldRuntime.label.label) {
                            if (fieldUIConfig.label) fieldUIConfig.label.label = fieldRuntime.label.label;
                        }
                    }
                    if (fieldRuntime.editor) {
                        fieldUIConfig.editor = fieldRuntime.editor;
                    }
                    if (fieldRuntime.renderer) {
                        fieldUIConfig.renderer = fieldRuntime.renderer;
                    }
                    if (fieldRuntime.extraActions) {
                        fieldUIConfig.extraActions = fieldRuntime.extraActions;
                    }
                    if (fieldRuntime.elementClasses) {
                        fieldUIConfig.elementClasses = fieldRuntime.elementClasses;
                    }

                    // change dimensions and layout if needed
                    if (fieldRuntime.fieldDimensions) {
                        fieldUIConfig.containedBy = {
                            type: 'div',
                            classes: `col-sm-12 col-md-${fieldRuntime.fieldDimensions.columnSpan}`
                        };
                        if (fieldRuntime.fieldDimensions.spacingClasses) {
                            fieldUIConfig.containedBy.classes += ' ' + fieldRuntime.fieldDimensions.spacingClasses;
                        }
                        if (fieldUIConfig.label) {
                            fieldUIConfig.label.classes = 'col-12 col-form-label'
                        }
                    }

                }
            }
            fieldUIConfigs.push(fieldUIConfig);
        });
        if (!runtimeConfig.hasExternalControl) {
            formConfig.buttonsContainedBy = {
                type: 'div',
                classes: 'd-flex w-100 justify-space-between mb-2',
            };
            formConfig.cancelButton = {
                text: '',
                classes: 'btn-info rounded p-1 mr-2 mt-2 w-100',
                iconClasses: 'fas fa-ban'
            };
            formConfig.saveButton = {
                text: '',
                classes: 'btn-primary rounded p-1 mt-2 w-100',
                iconClasses: 'fas fa-save'
            }
            formConfig.activeSave = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp;';
        }
        // sort the fields into display order

        // if runtime config has groups, use those instead
        if (runtimeConfig.fieldGroups) {
            formConfig.fieldGroups = [];

            runtimeConfig.fieldGroups.forEach((runtimeGroup) => {
                let fieldGroup: FieldGroup = {
                    containedBy: runtimeGroup.containedBy,
                    fields: []
                }

                if (runtimeGroup.subGroups) {
                    fieldGroup.subGroups = [];
                    runtimeGroup.subGroups.forEach((subRuntimeGroup) => {
                        let fieldSubgroup: FieldGroup = {
                            containedBy: subRuntimeGroup.containedBy,
                            fields: []
                        }
                        subRuntimeGroup.fields.forEach((subRuntimeFieldId) => {
                            const foundIndex = fieldUIConfigs.findIndex((fieldUIConfig) => fieldUIConfig.field.id === subRuntimeFieldId);
                            if (foundIndex >= 0) {
                                fieldSubgroup.fields.push(fieldUIConfigs[foundIndex]);
                            }
                        });
                        // @ts-ignore
                        fieldGroup.subGroups.push(fieldSubgroup);
                    });
                }

                runtimeGroup.fields.forEach((runtimeFieldId) => {
                    const foundIndex = fieldUIConfigs.findIndex((fieldUIConfig) => fieldUIConfig.field.id === runtimeFieldId);
                    if (foundIndex >= 0) {
                        fieldGroup.fields.push(fieldUIConfigs[foundIndex]);
                    }
                });
                formConfig.fieldGroups.push(fieldGroup);
            });

            // now find the fields that weren't in the runtime field groups and put them in another default field group
            const defaultFieldGroup: FieldGroup = {
                containedBy: {
                    type: 'div',
                    classes: 'col-sm-12',
                },
                fields: []
            }
            fieldUIConfigs.forEach((fieldUIConfig) => {
                if (!this.isFieldInCurrentFieldGroups(formConfig, fieldUIConfig)) {
                    defaultFieldGroup.fields.push(fieldUIConfig);
                }
            });


            if (defaultFieldGroup.fields.length > 0) formConfig.fieldGroups.unshift(defaultFieldGroup);
        } else {
            formConfig.fieldGroups[0].fields = fieldUIConfigs;
        }


        formConfig.fieldGroups.forEach((group) => {
            group.fields.sort((a:any, b:any) => {
                return (a.displayOrder - b.displayOrder);
            })

        });

        if (runtimeConfig.deleteButton && !runtimeConfig.hasExternalControl) {
            formConfig.deleteButton = {
                text: '',
                classes: 'btn-warning rounded p-1 mr-2 mt-2 w-100',
                iconClasses: 'fas fa-trash-alt'
            };
        }

        logger(formConfig);
        return formConfig;
    }

    getElementIdForDataFieldId(fieldId: string): string | undefined {
        return undefined;
    }

    protected isFieldInCurrentFieldGroups(formConfig: ItemViewUIDefinition, field: FieldUIConfig): boolean {
        let result = false;
        formConfig.fieldGroups.forEach((fieldGroup) => {
            // @ts-ignore
            const foundIndex = fieldGroup.fields.findIndex((fieldInGroup) => fieldInGroup.field.id === field.field.id);
            if (foundIndex >= 0) {
                result = true;
            }
        })
        return result;
    }

}
