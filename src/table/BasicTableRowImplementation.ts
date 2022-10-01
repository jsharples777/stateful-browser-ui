import debug from 'debug';
import {DefaultItemView} from "../view/item/DefaultItemView";
import {ItemViewConfigHelper} from "../view/item/ItemViewConfigHelper";
import {ViewFieldPermissionChecker} from "../view/ViewFieldPermissionChecker";
import {ItemFactoryResponse, ItemViewElementFactory} from "../factory/ItemViewElementFactory";
import {DataObjectDefinition, Field, FieldDefinition, ValidatableView} from "browser-state-management";
import {ItemEventType} from "../CommonTypes";
import {ItemEvent} from "../ConfigurationTypes";



const logger = debug('basic-table-row');

export class BasicTableRowImplementation extends DefaultItemView {
    protected idField: string;


    public constructor(idField: string, containerId: string, dataObjDef: DataObjectDefinition, configHelper: ItemViewConfigHelper, permissionChecker: ViewFieldPermissionChecker, hasExternalControl: boolean = false) {
        super(containerId, dataObjDef, configHelper, permissionChecker, hasExternalControl);
        this.idField = idField;

        this.__buildUIElements = this.__buildUIElements.bind(this);
        this.__getFactoryElements = this.__getFactoryElements.bind(this);
        this.__preDisplayCurrentDataObject = this.__preDisplayCurrentDataObject.bind(this);
        this._hidden = this._hidden.bind(this);
    }

    valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void {
        super.valueChanged(view, field, fieldDef, newValue);
        logger(`values has changed - attempting save`);
        let event: ItemEvent = {
            target: this,
            identifier: this.getId(),
            eventType: ItemEventType.SAVING
        }
        this.itemViewEvent(this.dataObjDef.displayName, event, this.currentDataObj);
    }

    getRowElement(): HTMLTableRowElement | null {
        let result = null;
        if (this.factoryElements) {
            result = <HTMLTableRowElement>this.factoryElements.top
        }
        return result;
    }

    protected __buildUIElements() {
        // do nothing here, we build our ui element just before display
        logger(`not loading ui elements yet, awaiting object`);
    }

    protected __getFactoryElements(): ItemFactoryResponse {
        return ItemViewElementFactory.getInstance().createTableRowElements(this.id, this, this.listeners, <any>(this.uiDef), this.fieldListeners);
    }

    protected buildTableRowElements() {
        logger(`loading ui elements now using the super class`);
        super.__buildUIElements();
        logger(`Add ourselves to the container`);
        super._visible();

    }

    protected __preDisplayCurrentDataObject(dataObj: any) {
        this.id = dataObj[this.idField];
        logger(`pre-display data object id is ${this.id}`);
        this.buildTableRowElements();
    }

    protected _hidden() {
    }
}
