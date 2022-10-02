import debug from 'debug';
import { DataObjectFactory } from "browser-state-management/dist/model/DataObjectFactory";
import { AbstractStatefulCollectionView } from "./AbstractStatefulCollectionView";
const logger = debug('data-object-collection-view');
export class DataObjectCollectionView extends AbstractStatefulCollectionView {
    constructor(uiConfig, stateManager, stateName) {
        super(uiConfig, stateManager, stateName);
        this.currentObjects = [];
    }
    getDataObject(id) {
        let result = null;
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === id);
        if (foundIndex >= 0) {
            result = this.currentObjects[foundIndex];
        }
        return result;
    }
    removeDataObject(dataObj) {
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === dataObj.getUniqueId());
        if (foundIndex >= 0) {
            this.currentObjects.splice(foundIndex, 1);
            dataObj.delete();
        }
    }
    updateDataObject(dataObj) {
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === dataObj.getUniqueId());
        if (foundIndex >= 0) {
            this.currentObjects.splice(foundIndex, 1, dataObj);
            dataObj.persist();
        }
    }
    addDataObject(dataObj) {
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === dataObj.getUniqueId());
        if (foundIndex >= 0) {
            this.currentObjects.splice(foundIndex, 1, dataObj);
        }
        else {
            this.currentObjects.push(dataObj);
        }
        dataObj.persist();
    }
    setFieldValue(objectId, fieldId, value) {
        const dataObject = this.getDataObject(objectId);
        if (dataObject) {
            dataObject.setValue(fieldId, value);
            dataObject.persist();
        }
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
        const dataObj = DataObjectFactory.getInstance().createDataObjectFromData(this.collectionName, itemAdded, true);
        dataObj.setPersisted(true);
        this.addDataObject(dataObj);
        super.stateChangedItemAdded(managerName, name, itemAdded);
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
        const dataObj = DataObjectFactory.getInstance().createDataObjectFromData(this.collectionName, itemRemoved, true);
        dataObj.setPersisted(true);
        this.removeDataObject(dataObj);
        super.stateChangedItemRemoved(managerName, name, itemRemoved);
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
        const dataObj = DataObjectFactory.getInstance().createDataObjectFromData(this.collectionName, itemNewValue, true);
        dataObj.setPersisted(true);
        this.updateDataObject(dataObj);
        super.stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue);
    }
    getIdForItemInNamedCollection(name, item) {
        return item.getUniqueId();
    }
    renderDisplayForItemInNamedCollection(containerEl, name, item) {
        throw item.getDescription();
    }
    getItemDescription(from, item) {
        return item.getDescription();
    }
    updateViewForNamedCollection(name, newState) {
        this.currentObjects = DataObjectFactory.getInstance().createDataObjectsFromStateNameAndData(name, newState, true);
        super.updateViewForNamedCollection(name, this.currentObjects);
    }
}
//# sourceMappingURL=DataObjectCollectionView.js.map