import { AbstractView } from "./AbstractView";
import { DetailViewListenerForwarder } from "../delegate/DetailViewListenerForwarder";
export class DetailViewImplementation extends AbstractView {
    constructor(uiConfig, renderer) {
        super(uiConfig);
        this.currentItem = null;
        this.renderer = renderer;
        const forwarder = new DetailViewListenerForwarder();
        this.eventForwarder = forwarder;
        this.renderer.setView(this);
        this.renderer.setEventForwarder(forwarder);
    }
    addEventDetailListener(listener) {
        this.eventForwarder.addListener(listener);
    }
    getItemId(name, item) {
        return '';
    }
    getItemDescription(name, item) {
        return '';
    }
    hasActionPermission(actionName, from, item) {
        return true;
    }
    getItem(from, identifier) {
        return this.currentItem;
    }
    clearDisplay() {
        this.renderer.reset();
    }
    clearReadOnly() {
        this.renderer.clearReadOnly();
    }
    setReadOnly() {
        this.renderer.setReadOnly();
    }
    isReadOnly() {
        return this.renderer.isReadOnly();
    }
    createItem(dataObj) {
        return this.renderer.createItem(dataObj);
    }
    displayItem(dataObj) {
        this.currentItem = dataObj;
        if (this.renderer.hasPermissionToUpdateItem(dataObj)) {
            this.renderer.displayItem(dataObj);
        }
        else {
            this.renderer.displayItemReadonly(dataObj);
        }
        this.show();
    }
    hide() {
        this.renderer.hide();
    }
    show() {
        this.renderer.show();
    }
    render() {
        this.displayItem(this.currentItem);
    }
    onDocumentLoaded() {
        this.renderer.onDocumentLoaded();
        super.onDocumentLoaded();
    }
    hasPermissionToDeleteItem(item) {
        return this.renderer.hasPermissionToDeleteItem(item);
    }
    hasPermissionToUpdateItem(item) {
        return this.renderer.hasPermissionToUpdateItem(item);
    }
    handleActionItem(actionName, selectedItem) {
        this.renderer.handleActionItem(actionName, selectedItem);
    }
    isDisplayingItem(dataObj) {
        return this.renderer.isDisplayingItem(dataObj);
    }
    hasChanged() {
        return this.renderer.hasChanged();
    }
    initialise(runtimeConfig) {
        this.renderer.initialise(runtimeConfig);
    }
}
//# sourceMappingURL=DetailViewImplementation.js.map