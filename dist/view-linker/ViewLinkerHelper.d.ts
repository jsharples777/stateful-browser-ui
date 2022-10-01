import { DataObjectDefinition, DataObjectListener, StateManager, UndefinedBoolean } from "browser-state-management";
import { AbstractStatefulCollectionView } from "../view/implementation/AbstractStatefulCollectionView";
import { ViewFieldPermissionChecker } from "../view/ViewFieldPermissionChecker";
import { ItemViewListener } from "../view/item/ItemViewListener";
import { Form } from "../form/Form";
import { DetailViewRuntimeConfig } from "../ConfigurationTypes";
import { SidebarViewContainer } from "../container/SidebarViewContainer";
import { LinkedCollectionDetailController } from "../helper/LinkedCollectionDetailController";
import { ItemViewConfigHelper } from "../view/item/ItemViewConfigHelper";
import { CollectionView } from "../view/interface/CollectionView";
import { DetailView } from "../view/interface/DetailView";
export declare type LinkHelperConfig = {
    listView: AbstractStatefulCollectionView;
    listContainerId: string;
    dataObjectName: string;
    detailContainerId: string;
    detailViewName: string;
    dataObjectListener?: DataObjectListener;
    createButtonId?: string;
    hasExternalControl?: UndefinedBoolean;
    sidebar?: SidebarViewContainer;
    formListener?: ItemViewListener;
    runtimeConfig?: DetailViewRuntimeConfig;
    fieldPermissionChecker?: ViewFieldPermissionChecker;
    formConfigHelper?: ItemViewConfigHelper;
    stateManager: StateManager;
    autoscrollOnNewContent?: UndefinedBoolean;
    autoSaveOnCreateNew?: UndefinedBoolean;
    autoSave?: UndefinedBoolean;
};
export declare type ViewLinkerResult = {
    form?: Form;
    listView?: CollectionView;
    detailView?: DetailView;
    linker?: LinkedCollectionDetailController;
    dataObjDef?: DataObjectDefinition;
};
export declare class ViewLinkerHelper {
    private static _instance;
    private constructor();
    static getInstance(): ViewLinkerHelper;
    onDocumentLoaded(config: LinkHelperConfig): ViewLinkerResult;
}
