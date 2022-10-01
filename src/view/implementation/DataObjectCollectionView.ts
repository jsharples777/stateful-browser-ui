import debug from 'debug';
import {CollectionView} from "../interface/CollectionView";
import {CollectionViewListener} from "../interface/CollectionViewListener";
import {AbstractCollectionView} from "./AbstractCollectionView";
import {CollectionViewListenerForwarder} from "../delegate/CollectionViewListenerForwarder";
import {View} from "../interface/View";
import {CollectionViewDOMConfig} from "../../ConfigurationTypes";
import {
    DataObject, DataObjectDefinition,
    DataObjectListener,
    ObjectDefinitionRegistry,
    StateChangeListener,
    StateManager
} from "browser-state-management";
import {DataObjectFactory} from "browser-state-management/dist/model/DataObjectFactory";
import {AbstractStatefulCollectionView} from "./AbstractStatefulCollectionView";


const logger = debug('data-object-collection-view');

export class DataObjectCollectionView extends AbstractStatefulCollectionView implements StateChangeListener, CollectionViewListener {
    protected currentObjects:DataObject[] = [];

    protected constructor(uiConfig: CollectionViewDOMConfig, stateManager: StateManager, stateName: string) {
        super(uiConfig, stateManager,stateName);
    }

    public getDataObject(id:string):DataObject|null {
        let result:DataObject|null = null;
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === id);
        if (foundIndex >= 0) {
            result = this.currentObjects[foundIndex];
        }
        return result;
    }

    protected removeDataObject(dataObj:DataObject):void {
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === dataObj.getUniqueId());
        if (foundIndex >= 0) {
            this.currentObjects.splice(foundIndex,1);
            dataObj.delete();
        }
    }

    protected updateDataObject(dataObj:DataObject):void {
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === dataObj.getUniqueId());
        if (foundIndex >= 0) {
            this.currentObjects.splice(foundIndex,1,dataObj);
            dataObj.persist();
        }
    }

    protected addDataObject(dataObj:DataObject):void {
        const foundIndex = this.currentObjects.findIndex((obj) => obj.getUniqueId() === dataObj.getUniqueId());
        if (foundIndex >= 0) {
            this.currentObjects.splice(foundIndex,1,dataObj);
        }
        else {
            this.currentObjects.push(dataObj);
        }
        dataObj.persist();
    }

    setFieldValue(objectId: string, fieldId: string, value: any): void {
        const dataObject = this.getDataObject(objectId);
        if (dataObject) {
            dataObject.setValue(fieldId,value);
            dataObject.persist();
        }
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
        const dataObj:DataObject = DataObjectFactory.getInstance().createDataObjectFromData(this.collectionName,itemAdded,true);
        dataObj.setPersisted(true);
        this.addDataObject(dataObj);
        super.stateChangedItemAdded(managerName,name,itemAdded);
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
        const dataObj:DataObject = DataObjectFactory.getInstance().createDataObjectFromData(this.collectionName,itemRemoved,true);
        dataObj.setPersisted(true);
        this.removeDataObject(dataObj);
        super.stateChangedItemRemoved(managerName,name,itemRemoved);
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
        const dataObj:DataObject = DataObjectFactory.getInstance().createDataObjectFromData(this.collectionName,itemNewValue,true);
        dataObj.setPersisted(true);
        this.updateDataObject(dataObj);
        super.stateChangedItemUpdated(managerName,name,itemUpdated, itemNewValue);
    }


    getIdForItemInNamedCollection(name: string, item: DataObject): string {
        return item.getUniqueId();
    }

    renderDisplayForItemInNamedCollection(containerEl: HTMLElement, name: string, item: DataObject): void {
        throw item.getDescription();
    }

    public getItemDescription(from: string, item: DataObject): string {
        return item.getDescription();
    }


    updateViewForNamedCollection(name: string, newState: any) {
        this.currentObjects = DataObjectFactory.getInstance().createDataObjectsFromStateNameAndData(name, newState, true);
        super.updateViewForNamedCollection(name, this.currentObjects);
    }


}
