import debug from 'debug';
import { LimitedChoiceTextRenderer } from "./LimitedChoiceTextRenderer";
import { BasicFieldOperations, FIELD_CreatedOn, FIELD_ModifiedOn, FieldType } from "browser-state-management";
import { CollectionViewSorterDirection } from "../ConfigurationTypes";
import { defaultGetValue, FieldLabelPosition, UIFieldType } from "../CommonTypes";
const logger = debug('bootstrap-tabular-config-helper');
export class BootstrapTableConfigHelper {
    constructor() {
    }
    static getInstance() {
        if (!(BootstrapTableConfigHelper._instance)) {
            BootstrapTableConfigHelper._instance = new BootstrapTableConfigHelper();
        }
        return BootstrapTableConfigHelper._instance;
    }
    generateTableConfig(dataObjDef, runtimeConfig) {
        let fieldOperations = new BasicFieldOperations();
        let choiceRenderer = new LimitedChoiceTextRenderer();
        // create the Field UI config for each field
        let fieldUIConfigs = [];
        let columnHeaderConfigs = [];
        dataObjDef.fields.forEach((fieldDef, index) => {
            let fieldType = UIFieldType.text;
            switch (fieldDef.type) {
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
                    }
                    else {
                        fieldType = UIFieldType.text;
                    }
                    break;
                }
                case (FieldType.uuid):
                case (FieldType.id): {
                    fieldType = UIFieldType.hidden;
                    break;
                }
            }
            // see if the field was supplied with a display order, no order, no display for a table
            const displayOrder = runtimeConfig.fieldDisplayOrders.find((value) => value.fieldId === fieldDef.id);
            let displayOrderValue = index;
            if (displayOrder) {
                displayOrderValue = displayOrder.displayOrder;
                if ((fieldDef.type !== FieldType.id) && (fieldDef.type !== FieldType.uuid) && (fieldType !== UIFieldType.hidden)) { // no labels, descriptions, container for id,uuid
                    let headerConfig = {
                        field: fieldDef,
                        element: {
                            type: 'th',
                            attributes: [{ name: 'scope', value: 'col' }],
                            classes: '',
                            innerHTML: fieldDef.displayName
                        },
                        displayOrder: displayOrderValue,
                        sortDirection: CollectionViewSorterDirection.ascending
                    };
                    // construct the field ui config
                    let fieldUIConfig = {
                        field: fieldDef,
                        displayOrder: displayOrderValue,
                        elementType: UIFieldType.tableData,
                        elementClasses: 'text-center',
                        renderer: fieldOperations,
                        getValue: defaultGetValue
                    };
                    if (fieldDef.type === FieldType.limitedChoice) {
                        fieldUIConfig.renderer = choiceRenderer;
                    }
                    // see if the field was supplied with a field runtime
                    if (runtimeConfig.fieldRuntimeConfigs) {
                        const fieldRuntime = runtimeConfig.fieldRuntimeConfigs.find((value) => value.fieldId === fieldDef.id);
                        if (fieldRuntime) {
                            if (fieldRuntime.validator) {
                                if (fieldUIConfig.validator)
                                    fieldUIConfig.validator.validator = fieldRuntime.validator;
                            }
                            if (fieldRuntime.editor) {
                                if (fieldUIConfig.editor)
                                    fieldUIConfig.editor = fieldRuntime.editor;
                            }
                            if (fieldRuntime.renderer) {
                                if (fieldUIConfig.renderer)
                                    fieldUIConfig.renderer = fieldRuntime.renderer;
                            }
                            if (fieldRuntime.label) {
                                if (fieldRuntime.label.labelPosition === FieldLabelPosition.noLabel) {
                                    if (headerConfig.element)
                                        headerConfig.element.innerHTML = '';
                                }
                                if (fieldRuntime.label.label) {
                                    if (fieldUIConfig.label)
                                        fieldUIConfig.label.label = fieldRuntime.label.label;
                                }
                            }
                        }
                    }
                    columnHeaderConfigs.push(headerConfig);
                    fieldUIConfigs.push(fieldUIConfig);
                }
            }
        });
        let actionColumn = null;
        if (runtimeConfig.hasActions) {
            actionColumn = {
                element: {
                    type: 'th',
                    attributes: [{ name: 'scope', value: 'col' }],
                    classes: 'text-right',
                    innerHTML: 'Actions'
                },
                displayOrder: 1000,
                sortDirection: CollectionViewSorterDirection.ascending
            };
        }
        const tableConfig = {
            id: dataObjDef.id,
            displayName: dataObjDef.displayName,
            container: {
                type: 'div',
                classes: 'table-responsive'
            },
            table: {
                type: 'table',
                classes: 'table table-hover table-sm'
            },
            header: {
                type: 'thead',
                classes: ''
            },
            headerColumns: columnHeaderConfigs,
            body: {
                type: 'tbody',
                classes: ''
            },
            columns: fieldUIConfigs,
            itemDetailColumn: runtimeConfig.itemDetailColumn,
            editableFields: runtimeConfig.editableFields,
            lazyLoadPageSize: runtimeConfig.lazyLoadPageSize,
            sortableTableHeaders: runtimeConfig.sortableTableHeaders
        };
        // sort the fields into display order
        tableConfig.columns.sort((a, b) => {
            return (a.displayOrder - b.displayOrder);
        });
        tableConfig.headerColumns.sort((a, b) => {
            return (a.displayOrder - b.displayOrder);
        });
        if (actionColumn) {
            tableConfig.actionColumn = actionColumn;
        }
        if (runtimeConfig.itemDetailLabel && (runtimeConfig.itemDetailColumn < tableConfig.headerColumns.length)) {
            const headerConfig = tableConfig.headerColumns[runtimeConfig.itemDetailColumn - 1];
            headerConfig.element.innerHTML = runtimeConfig.itemDetailLabel;
        }
        logger(tableConfig);
        return tableConfig;
    }
}
//# sourceMappingURL=BootstrapTableConfigHelper.js.map