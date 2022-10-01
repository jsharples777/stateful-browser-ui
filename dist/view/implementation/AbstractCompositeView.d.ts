import { StateManager } from "browser-state-management";
import { ItemViewListener } from "../item/ItemViewListener";
import { LinkHelperConfig } from "../../view-linker/ViewLinkerHelper";
import { ItemEvent } from "../../ConfigurationTypes";
import { CollectionView } from "../interface/CollectionView";
import { Form } from "../../form/Form";
import { DetailView } from "../interface/DetailView";
import { ViewVisibility } from "../interface/ViewVisibility";
import { LinkedCollectionDetailController } from "../../helper/LinkedCollectionDetailController";
export declare abstract class AbstractCompositeView implements ItemViewListener, ViewVisibility {
    protected isVisible: boolean;
    protected listView: CollectionView;
    protected detailView: DetailView;
    protected form: Form;
    protected linker: LinkedCollectionDetailController;
    protected hasFirstRender: boolean;
    protected stateManager: StateManager;
    protected isExecutingModify: boolean;
    protected stateName: string;
    constructor();
    itemViewHasChanged(name: string): void;
    hide(): void;
    isShowing(): boolean;
    show(): void;
    abstract fieldAction(name: string, event: ItemEvent): void;
    itemViewEvent(name: string, event: ItemEvent, rowValues?: any): boolean;
    abstract onDocumentLoaded(): void;
    protected setupViewLinker(config: LinkHelperConfig): void;
}
