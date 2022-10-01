import {DetailViewRenderer} from "../interface/DetailViewRenderer";
import {ViewFieldPermissionChecker} from "../ViewFieldPermissionChecker";
import {ViewListener} from "../interface/ViewListener";
import {DetailViewRuntimeConfig, ItemEvent, ViewDOMConfig} from "../../ConfigurationTypes";
import {ItemViewListener} from "../item/ItemViewListener";
import {Form} from "../../form/Form";
import {browserUtil, DataObjectDefinition} from "browser-state-management";
import {ItemEventType} from "../../CommonTypes";
import {ItemViewConfigHelper} from "../item/ItemViewConfigHelper";
import {DetailView} from "../interface/DetailView";
import {DetailViewListenerForwarder} from "../delegate/DetailViewListenerForwarder";
import {BasicFormImplementation} from "../../form/BasicFormImplementation";
import debug from 'debug';


const logger = debug('form-detail-view-renderer')

export class FormDetailViewRenderer implements DetailViewRenderer, ItemViewListener {
    protected objDef: DataObjectDefinition;
    protected form: Form | null = null;
    protected currentItem: any;
    protected isNewItem: boolean;
    protected containerId: string;
    protected forwarder: DetailViewListenerForwarder | null;
    protected view: DetailView | null;
    protected permissionChecker: ViewFieldPermissionChecker;
    protected configHelper: ItemViewConfigHelper;
    protected hasExternalControl: boolean;

    constructor(containerId: string, objDef: DataObjectDefinition, permissionChecker: ViewFieldPermissionChecker, configHelper: ItemViewConfigHelper, hasExternalControl: boolean = false) {
        this.containerId = containerId;
        this.objDef = objDef;
        this.currentItem = {};
        this.isNewItem = false;
        this.forwarder = null;
        this.view = null;
        this.permissionChecker = permissionChecker;
        this.configHelper = configHelper;
        this.hasExternalControl = hasExternalControl;
    }

    isShowing(): boolean {
        if (this.view) {
            return this.view.isShowing();
        }
        return true;
    }

    hasActionPermission(actionName: string, from: string, item: any): boolean {
        return true;
    }

    setEventForwarder(forwarder: DetailViewListenerForwarder): void {
        this.forwarder = forwarder;
    }

    public setView(view: DetailView): void {
        this.view = view;
    }

    onDocumentLoaded(): void {
        this.form = new BasicFormImplementation(this.containerId, this.objDef, this.configHelper, this.permissionChecker, this.hasExternalControl);
        this.form.addListener(this);
    }

    reset(): void {
        if (this.form) this.form.reset();
    }

    initialise(runtimeConfig: DetailViewRuntimeConfig): void {
        if (this.form) this.form.initialise(runtimeConfig);
    }

    displayItemReadonly(dataObject: any): void {
        this.isNewItem = false;
        if (this.form) {
            this.form.displayOnly(dataObject);
            if (this.form.isAutoScroll()) this.form.scrollToTop();
        }

    }

    getName(): string {
        return this.objDef.displayName;
    }

    setContainedBy(container: HTMLElement): void {
        throw new Error("Method not implemented.");
    }

    addEventListener(listener: ViewListener): void {
        throw new Error("Method not implemented.");
    }

    hasChanged(): boolean {
        let result = false;
        if (this.form) result = this.form.hasChanged();
        return result;
    }

    getUIConfig(): ViewDOMConfig {
        throw new Error("Method not implemented.");
    }

    getDataSourceKeyId(): string {
        throw new Error("Method not implemented.");
    }

    public clearDisplay(): void {
        this.isNewItem = false;
        if (this.form) {
            this.form.reset();
            if (this.form.isAutoScroll()) this.form.scrollToTop();
        }
    }

    public clearReadOnly(): void {
        if (this.form) this.form.clearReadOnly();
    }

    public setReadOnly(): void {
        if (this.form) this.form.setReadOnly();
    }

    public isReadOnly(): boolean {
        let result = false;
        if (this.form) result = this.form.isReadOnly();
        return result;
    }

    public createItem(dataObj: any | null): any {
        this.currentItem = {};
        logger(`Creating new item with form ${this.form?.getId()}`);
        if (this.form) {
            this.isNewItem = true;
            this.currentItem = this.form.startCreateNew(dataObj);
            if (this.form.isAutoScroll()) this.form.scrollToTop();
        }
        if (!browserUtil.isMobileDevice()) $('[data-toggle="tooltip"]').tooltip();
        return this.currentItem;
    }

    public displayItem(dataObj: any): void {
        this.currentItem = dataObj;
        this.isNewItem = false;

        if (this.hasPermissionToUpdateItem(dataObj)) {
            if (this.form) {
                this.form.startUpdate(dataObj);
                if (this.form.isAutoScroll()) this.form.scrollToTop();
            }
        } else {
            if (this.form) {
                this.form.displayOnly(dataObj);
                if (this.form.isAutoScroll()) this.form.scrollToTop();
            }
        }
        if (!browserUtil.isMobileDevice()) $('[data-toggle="tooltip"]').tooltip();
    }


    public hide(): void {
        if (this.form) this.form.setIsVisible(false);
    }

    public show(): void {
        if (this.form) {
            this.form.setIsVisible(true);

            if (this.form.isAutoScroll()) this.form.scrollToTop();

        }
    }

    render(): void {
        this.displayItem(this.currentItem);
        this.show();
    }


    public hasPermissionToDeleteItem(item: any): boolean {
        return this.permissionChecker.hasPermissionToDeleteItem(item);
    }

    public hasPermissionToUpdateItem(item: any): boolean {
        return this.permissionChecker.hasPermissionToUpdateItem(item);
    }

    public getForm() {
        return this.form;
    }

    handleActionItem(actionName: string, selectedItem: any): void {

    }

    isDisplayingItem(dataObj: any): boolean {
        let result = false;
        if (this.currentItem) {
            if (this.form) {
                result = this.form.isDisplayingItem(dataObj);
            }
        }
        return result;
    }

    public itemViewEvent(name: string, event: ItemEvent, formValues?: any): boolean {
        // catch form events for user leaving the form
        switch (event.eventType) {
            case (ItemEventType.CANCELLING): {
                logger(`Form is cancelling`);
                break;
            }
            case (ItemEventType.CANCELLING_ABORTED): {
                logger(`Form is cancelling - aborted`);
                break;
            }
            case (ItemEventType.CANCELLED): {
                logger(`Form is cancelled - resetting`);
                this.currentItem = formValues;
                if (this.forwarder && this.view) this.forwarder.cancelled(this.view, this.currentItem);
                if (this.form) {
                    if (this.form.isAutoScroll()) this.form.scrollToTop();
                }
                break;
            }
            case (ItemEventType.DELETING): {
                logger(`Form is deleting`);
                break;
            }
            case (ItemEventType.DELETE_ABORTED): {
                logger(`Form is deleting - aborted`);
                break;
            }
            case (ItemEventType.DELETED): {
                logger(`Form is deleted - resetting`);
                this.currentItem = formValues;
                if (this.forwarder && this.view) this.forwarder.deletedItem(this.view, this.currentItem);
                if (this.form) {
                    if (this.form.isAutoScroll()) this.form.scrollToTop();
                }
                // user is deleting the object, will become invisible
                break;
            }
            case (ItemEventType.SAVE_ABORTED): {
                if (this.form) {
                    if (this.form.isAutoScroll()) this.form.scrollToTop();
                }
                logger(`Form save cancelled`);
                break;
            }
            case (ItemEventType.SAVED): {
                logger(`Form is saved with data`);
                if (this.form) {
                    let formattedObj = this.form?.getFormattedDataObject();
                    if (this.isNewItem) {
                        if (this.forwarder && this.view) this.forwarder.saveNewItem(this.view, formattedObj);
                    } else {
                        if (this.forwarder && this.view) this.forwarder.updateItem(this.view, formattedObj);
                    }
                    this.isNewItem = false;
                    if (this.form) {
                        if (this.form.isAutoScroll()) this.form.scrollToTop();
                    }
                }

                break;
            }
            case (ItemEventType.SAVING): {
                logger(`Form is saving`);
                break;
            }
            case (ItemEventType.COMPOSITE_EDIT): {
                logger(`Composite field edit ${event.fieldId}`);
                break;
            }
            case (ItemEventType.COMPOSITE_ARRAY_EDIT): {
                logger(`Composite field array edit ${event.fieldId}`);
                break;
            }
            case (ItemEventType.LINKED_EDIT): {
                logger(`Linked field edit ${event.fieldId}`);
                break;
            }
            case (ItemEventType.LINKED_ARRAY_EDIT): {
                logger(`Linked array field edit ${event.fieldId}`);
                break;
            }
        }
        return false;
    }

    getItemDescription(from: string, item: any): string {
        return "";
    }

    getItemId(from: string, item: any): string {
        return "";
    }

    itemViewHasChanged(name: string): void {
    }

    fieldAction(name: string, event: ItemEvent): void {
    }

}
