import debug from 'debug';
import { DefaultItemView } from "../view/item/DefaultItemView";
import { ItemViewElementFactory } from "../factory/ItemViewElementFactory";
import { ItemEventType } from "../CommonTypes";
const logger = debug('basic-table-row');
export class BasicTableRowImplementation extends DefaultItemView {
    constructor(idField, containerId, dataObjDef, configHelper, permissionChecker, hasExternalControl = false) {
        super(containerId, dataObjDef, configHelper, permissionChecker, hasExternalControl);
        this.idField = idField;
        this.__buildUIElements = this.__buildUIElements.bind(this);
        this.__getFactoryElements = this.__getFactoryElements.bind(this);
        this.__preDisplayCurrentDataObject = this.__preDisplayCurrentDataObject.bind(this);
        this._hidden = this._hidden.bind(this);
    }
    valueChanged(view, field, fieldDef, newValue) {
        super.valueChanged(view, field, fieldDef, newValue);
        logger(`values has changed - attempting save`);
        let event = {
            target: this,
            identifier: this.getId(),
            eventType: ItemEventType.SAVING
        };
        this.itemViewEvent(this.dataObjDef.displayName, event, this.currentDataObj);
    }
    getRowElement() {
        let result = null;
        if (this.factoryElements) {
            result = this.factoryElements.top;
        }
        return result;
    }
    __buildUIElements() {
        // do nothing here, we build our ui element just before display
        logger(`not loading ui elements yet, awaiting object`);
    }
    __getFactoryElements() {
        return ItemViewElementFactory.getInstance().createTableRowElements(this.id, this, this.listeners, (this.uiDef), this.fieldListeners);
    }
    buildTableRowElements() {
        logger(`loading ui elements now using the super class`);
        super.__buildUIElements();
        logger(`Add ourselves to the container`);
        super._visible();
    }
    __preDisplayCurrentDataObject(dataObj) {
        this.id = dataObj[this.idField];
        logger(`pre-display data object id is ${this.id}`);
        this.buildTableRowElements();
    }
    _hidden() {
    }
}
//# sourceMappingURL=BasicTableRowImplementation.js.map