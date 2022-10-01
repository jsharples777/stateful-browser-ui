import debug from "debug";
import { ViewListenerForwarder } from "../delegate/ViewListenerForwarder";
import { DRAGGABLE_FROM, DRAGGABLE_KEY_ID, DRAGGABLE_TYPE } from "../../CommonTypes";
const avLogger = debug('abstract-view-ts');
const avLoggerDetails = debug('abstract-view-ts-detail');
export class AbstractView {
    constructor(uiConfig) {
        this.containerEl = null;
        this.viewHasChanged = false;
        this.isVisible = false;
        this.uiConfig = uiConfig;
        this.viewEl = null;
        this.eventForwarder = new ViewListenerForwarder();
        this.handleDrop = this.handleDrop.bind(this);
    }
    getItemId(from, item) {
        throw new Error("Method not implemented.");
    }
    getItemDescription(from, item) {
        throw new Error("Method not implemented.");
    }
    hasActionPermission(actionName, from, item) {
        throw new Error("Not implemented");
    }
    getUIConfig() {
        return this.uiConfig;
    }
    addEventListener(listener) {
        this.eventForwarder.addListener(listener);
    }
    onDocumentLoaded() {
        this.viewEl = document.getElementById(this.uiConfig.resultsContainerId);
        this.eventForwarder.documentLoaded(this);
    }
    setContainedBy(container) {
        this.containerEl = container;
    }
    getName() {
        return this.uiConfig.dataSourceId;
    }
    hasChanged() {
        return this.viewHasChanged;
    }
    getDataSourceKeyId() {
        return AbstractView.DATA_SOURCE;
    }
    hide() {
        avLogger('AV hide');
        this.isVisible = false;
        this.clearDisplay();
    }
    show() {
        avLogger('AV show');
        this.isVisible = true;
        this.render();
    }
    handleDrop(event) {
        avLogger(`view ${this.getName()}: drop event`);
        avLoggerDetails(event.target);
        // @ts-ignore
        const draggedObjectJSON = event.dataTransfer.getData(DRAGGABLE_KEY_ID);
        const draggedObject = JSON.parse(draggedObjectJSON);
        avLoggerDetails(draggedObject);
        // check to see if we accept the dropped type and source
        const droppedObjectType = draggedObject[DRAGGABLE_TYPE];
        const droppedObjectFrom = draggedObject[DRAGGABLE_FROM];
        avLogger(`view ${this.getName()}: drop event from ${droppedObjectFrom} with type ${droppedObjectType}`);
        avLoggerDetails(this.uiConfig.drop);
        if (this.uiConfig.drop) {
            const acceptType = (this.uiConfig.drop.acceptTypes.findIndex((objectType) => objectType === droppedObjectType) >= 0);
            let acceptFrom = true;
            if (acceptType) {
                if (this.uiConfig.drop.acceptFrom) {
                    acceptFrom = (this.uiConfig.drop.acceptFrom.findIndex((from) => from === droppedObjectFrom) >= 0);
                }
                avLoggerDetails(`view ${this.getName()}: accepted type? ${acceptType} and from? ${acceptFrom}`);
                if (acceptType && acceptFrom) {
                    this.eventForwarder.itemDropped(this, draggedObject);
                }
            }
        }
    }
    isShowing() {
        return this.isVisible;
    }
}
AbstractView.DATA_SOURCE = 'data-source';
//# sourceMappingURL=AbstractView.js.map