import {CollectionView} from "../interface/CollectionView";
import {AbstractView} from "./AbstractView";

import debug from "debug";
import {CollectionViewRenderer} from "../interface/CollectionViewRenderer";
import {CollectionViewEventHandler} from "../interface/CollectionViewEventHandler";
import {CollectionViewListenerForwarder} from "../delegate/CollectionViewListenerForwarder";
import {CollectionViewListener} from "../interface/CollectionViewListener";
import {CollectionViewEventHandlerDelegate} from "../delegate/CollectionViewEventHandlerDelegate";
import {CollectionViewEventDelegate} from "../interface/CollectionViewEventDelegate";
import {
    CollectionViewDOMConfig,
    CollectionSortConfig,
    CollectionSortDirection,
    Modifier
} from "../../ConfigurationTypes";
import {CollectionFilter, CollectionFilterProcessor, isSame} from "browser-state-management";
import {CollectionSorter} from "../../util/CollectionSorter";

const avLogger = debug('collection-view-ts');
const avLoggerDetails = debug('collection-view-ts-detail');
const avLoggerFilter = debug('collection-view-ts-filter');

export type CollectionBuffer = {
    name: string,
    values: any[]
}

export abstract class AbstractCollectionView extends AbstractView implements CollectionView, CollectionViewEventHandler {

    protected collectionName: string;
    protected renderer: CollectionViewRenderer | null;
    protected selectedItem: any | null;
    protected collectionUIConfig: CollectionViewDOMConfig;
    protected eventHandlerDelegate: CollectionViewEventDelegate;
    protected filter: CollectionFilter | null = null;
    protected sorterConfig: CollectionSortConfig | null = null;
    protected onlyDisplayWithFilter: boolean = false;
    protected buffers: CollectionBuffer[] = [];

    protected constructor(uiConfig: CollectionViewDOMConfig, collectionName: string) {
        super(uiConfig.viewConfig);
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

    }

    abstract getIdForItemInNamedCollection(name: string, item: any): string;

    abstract getItemInNamedCollection(name: string, compareWith: any): any;

    abstract renderDisplayForItemInNamedCollection(containerEl: HTMLElement, name: string, item: any): void;

    abstract getItemDescription(from: string, item: any): string;

    abstract hasActionPermission(actionName: string, from: string, item: any): boolean;

    abstract setFieldValue(objectId: string, fieldId: string, value: any): void;

    abstract getDisplayedCollection(): any[];

    render(): void {
        avLogger('ACV render');
        this.updateViewForNamedCollection(this.collectionName, this.getBufferForName(this.collectionName));
    }

    clearDisplay(): void {
        avLogger('ACV clearDisplay');
        this.updateViewForNamedCollection(this.collectionName, []);
    }

    eventStartDrag(event: DragEvent): void {
        this.eventHandlerDelegate.eventStartDrag(event);
    }

    eventClickItem(event: MouseEvent): void {
        this.eventHandlerDelegate.eventClickItem(event);
    }

    eventDeleteClickItem(event: MouseEvent): void {
        this.eventHandlerDelegate.eventDeleteClickItem(event);
    }

    eventActionClicked(event: MouseEvent): void {
        this.eventHandlerDelegate.eventActionClicked(event);
    }

    public getCollectionName(): string {
        return this.collectionName;
    }

    getItemId(from: string, item: any): string {
        return this.getIdForItemInNamedCollection(from, item);
    }

    getCollectionUIConfig(): CollectionViewDOMConfig {
        return this.collectionUIConfig;
    }

    addEventCollectionListener(listener: CollectionViewListener) {
        this.eventForwarder.addListener(listener);
    }

    setContainedBy(container: HTMLElement): void {
        super.setContainedBy(container);
        if (this.uiConfig.drop) {
            avLoggerDetails(`view ${this.getName()}: Adding dragover events to ${this.uiConfig.dataSourceId}`)
            avLoggerDetails(container);
            container.addEventListener('dragover', (event) => {
                event.preventDefault();
            });
            container.addEventListener('drop', this.handleDrop);

        }

    }

    onDocumentLoaded() {
        super.onDocumentLoaded();
        if (this.renderer) this.renderer.onDocumentLoaded();
    }

    renderBackgroundForItemInNamedCollection(containerEl: HTMLElement, name: string, item: any): void {
    }

    compareItemsForEquality(item1: any, item2: any): boolean {
        return isSame(item1, item2);
    }

    getModifierForItemInNamedCollection(name: string, item: any): Modifier {
        return Modifier.normal;
    }

    public getSecondaryModifierForItemInNamedCollection(name: string, item: any): Modifier {
        return Modifier.normal;
    }

    getBadgeValueForItemInNamedCollection(name: string, item: any): number {
        return 0;
    }

    getBackgroundImageForItemInNamedCollection(name: string, item: any): string {
        return '';
    }

    updateViewForNamedCollection(name: string, newState: any): void {
        avLogger(`update named collection ${name} with new state`);
        avLogger(newState);
        if (this.viewEl && this.renderer) {
            if (this.isVisible) {
                avLogger('rendering visible state with filtering and sorting as required');

                let filteredState: any[] = CollectionFilterProcessor.getFilteredState(name, newState, this.filter, this.onlyDisplayWithFilter);

                // do we have a sorter?
                if (this.sorterConfig && (filteredState.length > 0)) {
                    filteredState = CollectionSorter.sort(filteredState,this.sorterConfig);
                } else {
                    // pre sort the collection for display
                    filteredState = filteredState.sort(this.applyDefaultSort);
                }


                this.renderer.setDisplayElementsForCollectionInContainer(this.viewEl, name, filteredState);
            } else {
                avLogger('rendering visible state as empty');
                this.renderer.setDisplayElementsForCollectionInContainer(this.viewEl, name, []);
            }
        } else {
            avLogger('missing renderer and/or view element');
            avLogger(this.renderer);
            avLogger(this.viewEl);
        }
    }

    hasPermissionToDeleteItemInNamedCollection(name: string, item: any): boolean {
        return true;
    }

    hasPermissionToUpdateItemInNamedCollection(name: string, item: any): boolean {
        return true;
    }

    hasPermissionForActionOnItemInNamedCollection(actionName: string, name: string, item: any): boolean {
        return true;
    }

    setRenderer(renderer: CollectionViewRenderer): void {
        this.renderer = renderer;
    }

    getSecondaryBadgeValueForItemInNamedCollection(name: string, item: any): number {
        return 0;
    }

    getTertiaryBadgeValueForItemInNamedCollection(name: string, item: any): number {
        return 0;
    }

    applyDefaultSort(item1: any, item2: any): number {
        return 0;
    }

    getItemIcons(name: string, item: any): string[] {
        return [];
    }

    prependItemIcons(name: string, item: any): boolean {
        return true;
    }

    applyFilter(filter: CollectionFilter): void {
        avLoggerFilter(filter);
        this.filter = filter;
        this.render();
    }

    applySorter(sorter: CollectionSortConfig): void {
        this.sorterConfig = sorter;
        this.render();
    }

    clearFilter(): void {
        avLoggerFilter('filter cleared');
        this.filter = null;
        this.render();
    }

    clearSorter(): void {
        this.sorterConfig = null;
        this.render();
    }

    hasFilter(): boolean {
        let result = false;
        if (this.filter) {
            result = true;
        }
        return result;
    }

    getCurrentFilter(): CollectionFilter | null {
        return this.filter;
    }

    hasSorter(): boolean {
        let result = false;
        if (this.sorterConfig) {
            result = true;
        }
        return result;
    }

    setOnlyDisplayWithFilter(onlyDisplayWithFilter: boolean): void {
        avLoggerFilter(`Only display with filter? ${onlyDisplayWithFilter}`);
        this.onlyDisplayWithFilter = onlyDisplayWithFilter;
    }

    protected setBufferForName(name: string, values: any[]): void {
        const foundIndex = this.buffers.findIndex((buffer) => buffer.name === name);
        let buffer: CollectionBuffer = {
            name: name,
            values: values
        }
        if (foundIndex < 0) {
            this.buffers.push(buffer);
        } else {
            this.buffers.splice(foundIndex, 1, buffer);
        }
    }

    protected getBufferForName(name: string): any[] {
        const foundIndex = this.buffers.findIndex((buffer) => buffer.name === name);
        let result: any[] = [];
        if (foundIndex >= 0) {
            result = this.buffers[foundIndex].values;
        }
        return result;
    }


    protected getFilteredState(currentState: any): any[] {
        let filteredState: any[] = [];
        // do we have a filter?
        if (this.filter) {
            if (currentState) {
                currentState.forEach((item: any) => {
                    // @ts-ignore
                    if (CollectionFilterProcessor.doesItemMatchFilterConfig(this.collectionName, item, this.filter)) {
                        filteredState.push(item);
                    }
                });
            }
        } else {
            // do we only show content with a filter?
            if (this.onlyDisplayWithFilter) {
                filteredState = [];
            } else {
                filteredState = currentState;
            }
        }
        return filteredState;

    }
}
