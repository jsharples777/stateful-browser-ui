import { AbstractView } from "./AbstractView";
import debug from "debug";
import { CollectionViewListenerForwarder } from "../delegate/CollectionViewListenerForwarder";
import { CollectionViewEventHandlerDelegate } from "../delegate/CollectionViewEventHandlerDelegate";
import { CollectionViewSorterDirection, Modifier } from "../../ConfigurationTypes";
import { CollectionFilterProcessor, isSame } from "browser-state-management";
const avLogger = debug('collection-view-ts');
const avLoggerDetails = debug('collection-view-ts-detail');
const avLoggerFilter = debug('collection-view-ts-filter');
export class AbstractCollectionView extends AbstractView {
    constructor(uiConfig, collectionName) {
        super(uiConfig.viewConfig);
        this.filter = null;
        this.sorterConfig = null;
        this.onlyDisplayWithFilter = false;
        this.buffers = [];
        this.collectionUIConfig = uiConfig;
        this.collectionName = collectionName;
        this.renderer = null;
        let forwarder = new CollectionViewListenerForwarder();
        this.eventForwarder = forwarder;
        this.eventHandlerDelegate = new CollectionViewEventHandlerDelegate(this, forwarder);
        this.updateViewForNamedCollection = this.updateViewForNamedCollection.bind(this);
        // event handlers
        this.eventStartDrag = this.eventStartDrag.bind(this);
        this.eventActionClicked = this.eventActionClicked.bind(this);
        this.eventClickItem = this.eventClickItem.bind(this);
        this.eventDeleteClickItem = this.eventDeleteClickItem.bind(this);
        this.useSorter = this.useSorter.bind(this);
    }
    render() {
        avLogger('ACV render');
        this.updateViewForNamedCollection(this.collectionName, this.getBufferForName(this.collectionName));
    }
    clearDisplay() {
        avLogger('ACV clearDisplay');
        this.updateViewForNamedCollection(this.collectionName, []);
    }
    eventStartDrag(event) {
        this.eventHandlerDelegate.eventStartDrag(event);
    }
    eventClickItem(event) {
        this.eventHandlerDelegate.eventClickItem(event);
    }
    eventDeleteClickItem(event) {
        this.eventHandlerDelegate.eventDeleteClickItem(event);
    }
    eventActionClicked(event) {
        this.eventHandlerDelegate.eventActionClicked(event);
    }
    getCollectionName() {
        return this.collectionName;
    }
    getItemId(from, item) {
        return this.getIdForItemInNamedCollection(from, item);
    }
    getCollectionUIConfig() {
        return this.collectionUIConfig;
    }
    addEventCollectionListener(listener) {
        this.eventForwarder.addListener(listener);
    }
    setContainedBy(container) {
        super.setContainedBy(container);
        if (this.uiConfig.drop) {
            avLoggerDetails(`view ${this.getName()}: Adding dragover events to ${this.uiConfig.dataSourceId}`);
            avLoggerDetails(container);
            container.addEventListener('dragover', (event) => {
                event.preventDefault();
            });
            container.addEventListener('drop', this.handleDrop);
        }
    }
    onDocumentLoaded() {
        super.onDocumentLoaded();
        if (this.renderer)
            this.renderer.onDocumentLoaded();
    }
    renderBackgroundForItemInNamedCollection(containerEl, name, item) {
    }
    compareItemsForEquality(item1, item2) {
        return isSame(item1, item2);
    }
    getModifierForItemInNamedCollection(name, item) {
        return Modifier.normal;
    }
    getSecondaryModifierForItemInNamedCollection(name, item) {
        return Modifier.normal;
    }
    getBadgeValueForItemInNamedCollection(name, item) {
        return 0;
    }
    getBackgroundImageForItemInNamedCollection(name, item) {
        return '';
    }
    updateViewForNamedCollection(name, newState) {
        avLogger(`update named collection ${name} with new state`);
        avLogger(newState);
        if (this.viewEl && this.renderer) {
            if (this.isVisible) {
                avLogger('rendering visible state with filtering and sorting as required');
                let filteredState = CollectionFilterProcessor.getFilteredState(name, newState, this.filter, this.onlyDisplayWithFilter);
                // do we have a sorter?
                if (this.sorterConfig && (filteredState.length > 0)) {
                    filteredState = filteredState.sort(this.useSorter);
                }
                else {
                    // pre sort the collection for display
                    filteredState = filteredState.sort(this.applyDefaultSort);
                }
                this.renderer.setDisplayElementsForCollectionInContainer(this.viewEl, name, filteredState);
            }
            else {
                avLogger('rendering visible state as empty');
                this.renderer.setDisplayElementsForCollectionInContainer(this.viewEl, name, []);
            }
        }
        else {
            avLogger('missing renderer and/or view element');
            avLogger(this.renderer);
            avLogger(this.viewEl);
        }
    }
    hasPermissionToDeleteItemInNamedCollection(name, item) {
        return true;
    }
    hasPermissionToUpdateItemInNamedCollection(name, item) {
        return true;
    }
    hasPermissionForActionOnItemInNamedCollection(actionName, name, item) {
        return true;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    getSecondaryBadgeValueForItemInNamedCollection(name, item) {
        return 0;
    }
    getTertiaryBadgeValueForItemInNamedCollection(name, item) {
        return 0;
    }
    applyDefaultSort(item1, item2) {
        return 0;
    }
    getItemIcons(name, item) {
        return [];
    }
    prependItemIcons(name, item) {
        return true;
    }
    applyFilter(filter) {
        avLoggerFilter(filter);
        this.filter = filter;
        this.render();
    }
    applySorter(sorter) {
        this.sorterConfig = sorter;
        this.render();
    }
    clearFilter() {
        avLoggerFilter('filter cleared');
        this.filter = null;
        this.render();
    }
    clearSorter() {
        this.sorterConfig = null;
        this.render();
    }
    hasFilter() {
        let result = false;
        if (this.filter) {
            result = true;
        }
        return result;
    }
    getCurrentFilter() {
        return this.filter;
    }
    hasSorter() {
        let result = false;
        if (this.sorterConfig) {
            result = true;
        }
        return result;
    }
    setOnlyDisplayWithFilter(onlyDisplayWithFilter) {
        avLoggerFilter(`Only display with filter? ${onlyDisplayWithFilter}`);
        this.onlyDisplayWithFilter = onlyDisplayWithFilter;
    }
    setBufferForName(name, values) {
        const foundIndex = this.buffers.findIndex((buffer) => buffer.name === name);
        let buffer = {
            name: name,
            values: values
        };
        if (foundIndex < 0) {
            this.buffers.push(buffer);
        }
        else {
            this.buffers.splice(foundIndex, 1, buffer);
        }
    }
    getBufferForName(name) {
        const foundIndex = this.buffers.findIndex((buffer) => buffer.name === name);
        let result = [];
        if (foundIndex >= 0) {
            result = this.buffers[foundIndex].values;
        }
        return result;
    }
    useFieldSorter(item1, item2, fieldId, direction) {
        let result = 0;
        const field1Value = item1[fieldId];
        const field2Value = item2[fieldId];
        if (field1Value && field2Value) {
            if (field1Value !== field2Value) {
                if (direction === CollectionViewSorterDirection.ascending) {
                    if (field1Value > field2Value) {
                        result = 1;
                    }
                    else {
                        result = -1;
                    }
                }
                if (direction === CollectionViewSorterDirection.descending) {
                    if (field1Value > field2Value) {
                        result = -1;
                    }
                    else {
                        result = 1;
                    }
                }
            }
        }
        else if (field1Value) {
            if (direction === CollectionViewSorterDirection.ascending) {
                result = 1;
            }
            if (direction === CollectionViewSorterDirection.descending) {
                result = -1;
            }
        }
        else if (field2Value) {
            if (direction === CollectionViewSorterDirection.ascending) {
                result = 1;
            }
            if (direction === CollectionViewSorterDirection.descending) {
                result = -1;
            }
        }
        return result;
    }
    useSorter(item1, item2) {
        let result = 0;
        if (this.sorterConfig) {
            result = this.useFieldSorter(item1, item2, this.sorterConfig.majorFieldId, this.sorterConfig.majorDirection);
            if (result === 0) {
                if (this.sorterConfig.minorFieldId) {
                    if (this.sorterConfig.minorDirection) {
                        result = this.useFieldSorter(item1, item2, this.sorterConfig.minorFieldId, this.sorterConfig.minorDirection);
                    }
                }
            }
        }
        return result;
    }
    getFilteredState(currentState) {
        let filteredState = [];
        // do we have a filter?
        if (this.filter) {
            if (currentState) {
                currentState.forEach((item) => {
                    // @ts-ignore
                    if (CollectionFilterProcessor.doesItemMatchFilterConfig(this.collectionName, item, this.filter)) {
                        filteredState.push(item);
                    }
                });
            }
        }
        else {
            // do we only show content with a filter?
            if (this.onlyDisplayWithFilter) {
                filteredState = [];
            }
            else {
                filteredState = currentState;
            }
        }
        return filteredState;
    }
}
//# sourceMappingURL=AbstractCollectionView.js.map