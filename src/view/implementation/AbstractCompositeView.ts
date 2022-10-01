

import {StateManager} from "browser-state-management";
import {ItemViewListener} from "../item/ItemViewListener";
import {LinkHelperConfig, ViewLinkerHelper} from "../../view-linker/ViewLinkerHelper";
import {ItemEvent} from "../../ConfigurationTypes";
import {CollectionView} from "../interface/CollectionView";
import {Form} from "../../form/Form";
import {DetailView} from "../interface/DetailView";
import {ViewVisibility} from "../interface/ViewVisibility";
import {ItemEventType} from "../../CommonTypes";
import {LinkedCollectionDetailController} from "../../helper/LinkedCollectionDetailController";

export abstract class AbstractCompositeView implements ItemViewListener, ViewVisibility {
    protected isVisible: boolean = false;
    // @ts-ignore
    protected listView: CollectionView;
    // @ts-ignore
    protected detailView: DetailView;
    // @ts-ignore
    protected form: Form;
    // @ts-ignore
    protected linker: LinkedCollectionDetailController;
    protected hasFirstRender: boolean = false;
    // @ts-ignore
    protected stateManager: StateManager;
    protected isExecutingModify: boolean = false;
    // @ts-ignore
    protected stateName: string;

    constructor() {
        this.itemViewEvent = this.itemViewEvent.bind(this);
    }

    itemViewHasChanged(name: string): void {
    }

    hide(): void {
        this.isVisible = false;
        //this.listView.hide();
        //this.detailView.hide();
    }

    isShowing(): boolean {
        return this.isVisible;
    }

    show(): void {
        this.isVisible = true;
        if (!this.hasFirstRender) {
            this.hasFirstRender = true;
            this.listView.show();
            this.listView.render();
        }
    }

    abstract fieldAction(name: string, event: ItemEvent): void;

    itemViewEvent(name: string, event: ItemEvent, rowValues?: any): boolean {
        switch (event.eventType) {
            case ItemEventType.MODIFYING: {
                if (!this.isExecutingModify) {
                    this.isExecutingModify = true;
                    this.stateManager.updateItemInState(this.stateName, rowValues, false);
                    this.isExecutingModify = false;
                }
                break;
            }
        }

        return false;
    }

    abstract onDocumentLoaded(): void;

    protected setupViewLinker(config: LinkHelperConfig): void {
        this.stateManager = config.stateManager;
        this.stateName = config.dataObjectName;
        const result = ViewLinkerHelper.getInstance().onDocumentLoaded(config);
        // @ts-ignore
        this.form = result.form;
        // @ts-ignore
        this.listView = result.listView;
        // @ts-ignore
        this.detailView = result.detailView;
        // @ts-ignore
        this.linker = result.linker;
        this.form.addListener(this);
    }
}
