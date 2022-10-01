import { browserUtil } from "browser-state-management";
import { ItemEventType } from "../../CommonTypes";
import { BasicFormImplementation } from "../../form/BasicFormImplementation";
import debug from 'debug';
const logger = debug('form-detail-view-renderer');
export class FormDetailViewRenderer {
    constructor(containerId, objDef, permissionChecker, configHelper, hasExternalControl = false) {
        this.form = null;
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
    isShowing() {
        if (this.view) {
            return this.view.isShowing();
        }
        return true;
    }
    hasActionPermission(actionName, from, item) {
        return true;
    }
    setEventForwarder(forwarder) {
        this.forwarder = forwarder;
    }
    setView(view) {
        this.view = view;
    }
    onDocumentLoaded() {
        this.form = new BasicFormImplementation(this.containerId, this.objDef, this.configHelper, this.permissionChecker, this.hasExternalControl);
        this.form.addListener(this);
    }
    reset() {
        if (this.form)
            this.form.reset();
    }
    initialise(runtimeConfig) {
        if (this.form)
            this.form.initialise(runtimeConfig);
    }
    displayItemReadonly(dataObject) {
        this.isNewItem = false;
        if (this.form) {
            this.form.displayOnly(dataObject);
            if (this.form.isAutoScroll())
                this.form.scrollToTop();
        }
    }
    getName() {
        return this.objDef.displayName;
    }
    setContainedBy(container) {
        throw new Error("Method not implemented.");
    }
    addEventListener(listener) {
        throw new Error("Method not implemented.");
    }
    hasChanged() {
        let result = false;
        if (this.form)
            result = this.form.hasChanged();
        return result;
    }
    getUIConfig() {
        throw new Error("Method not implemented.");
    }
    getDataSourceKeyId() {
        throw new Error("Method not implemented.");
    }
    clearDisplay() {
        this.isNewItem = false;
        if (this.form) {
            this.form.reset();
            if (this.form.isAutoScroll())
                this.form.scrollToTop();
        }
    }
    clearReadOnly() {
        if (this.form)
            this.form.clearReadOnly();
    }
    setReadOnly() {
        if (this.form)
            this.form.setReadOnly();
    }
    isReadOnly() {
        let result = false;
        if (this.form)
            result = this.form.isReadOnly();
        return result;
    }
    createItem(dataObj) {
        var _a;
        this.currentItem = {};
        logger(`Creating new item with form ${(_a = this.form) === null || _a === void 0 ? void 0 : _a.getId()}`);
        if (this.form) {
            this.isNewItem = true;
            this.currentItem = this.form.startCreateNew(dataObj);
            if (this.form.isAutoScroll())
                this.form.scrollToTop();
        }
        if (!browserUtil.isMobileDevice())
            $('[data-toggle="tooltip"]').tooltip();
        return this.currentItem;
    }
    displayItem(dataObj) {
        this.currentItem = dataObj;
        this.isNewItem = false;
        if (this.hasPermissionToUpdateItem(dataObj)) {
            if (this.form) {
                this.form.startUpdate(dataObj);
                if (this.form.isAutoScroll())
                    this.form.scrollToTop();
            }
        }
        else {
            if (this.form) {
                this.form.displayOnly(dataObj);
                if (this.form.isAutoScroll())
                    this.form.scrollToTop();
            }
        }
        if (!browserUtil.isMobileDevice())
            $('[data-toggle="tooltip"]').tooltip();
    }
    hide() {
        if (this.form)
            this.form.setIsVisible(false);
    }
    show() {
        if (this.form) {
            this.form.setIsVisible(true);
            if (this.form.isAutoScroll())
                this.form.scrollToTop();
        }
    }
    render() {
        this.displayItem(this.currentItem);
        this.show();
    }
    hasPermissionToDeleteItem(item) {
        return this.permissionChecker.hasPermissionToDeleteItem(item);
    }
    hasPermissionToUpdateItem(item) {
        return this.permissionChecker.hasPermissionToUpdateItem(item);
    }
    getForm() {
        return this.form;
    }
    handleActionItem(actionName, selectedItem) {
    }
    isDisplayingItem(dataObj) {
        let result = false;
        if (this.currentItem) {
            if (this.form) {
                result = this.form.isDisplayingItem(dataObj);
            }
        }
        return result;
    }
    itemViewEvent(name, event, formValues) {
        var _a;
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
                if (this.forwarder && this.view)
                    this.forwarder.cancelled(this.view, this.currentItem);
                if (this.form) {
                    if (this.form.isAutoScroll())
                        this.form.scrollToTop();
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
                if (this.forwarder && this.view)
                    this.forwarder.deletedItem(this.view, this.currentItem);
                if (this.form) {
                    if (this.form.isAutoScroll())
                        this.form.scrollToTop();
                }
                // user is deleting the object, will become invisible
                break;
            }
            case (ItemEventType.SAVE_ABORTED): {
                if (this.form) {
                    if (this.form.isAutoScroll())
                        this.form.scrollToTop();
                }
                logger(`Form save cancelled`);
                break;
            }
            case (ItemEventType.SAVED): {
                logger(`Form is saved with data`);
                if (this.form) {
                    let formattedObj = (_a = this.form) === null || _a === void 0 ? void 0 : _a.getFormattedDataObject();
                    if (this.isNewItem) {
                        if (this.forwarder && this.view)
                            this.forwarder.saveNewItem(this.view, formattedObj);
                    }
                    else {
                        if (this.forwarder && this.view)
                            this.forwarder.updateItem(this.view, formattedObj);
                    }
                    this.isNewItem = false;
                    if (this.form) {
                        if (this.form.isAutoScroll())
                            this.form.scrollToTop();
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
    getItemDescription(from, item) {
        return "";
    }
    getItemId(from, item) {
        return "";
    }
    itemViewHasChanged(name) {
    }
    fieldAction(name, event) {
    }
}
//# sourceMappingURL=FormDetailViewRenderer.js.map