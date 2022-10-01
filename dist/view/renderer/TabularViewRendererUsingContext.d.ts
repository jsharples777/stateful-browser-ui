import { CollectionViewRenderer } from "../interface/CollectionViewRenderer";
import { CollectionView } from "../interface/CollectionView";
import { CollectionViewEventHandler } from "../interface/CollectionViewEventHandler";
import { TableUIConfig } from "./TableUITypeDefs";
export declare class TabularViewRendererUsingContext implements CollectionViewRenderer {
    static SORT_DIRECTION_ATTRIBUTE: string;
    static SORTABLE_TH_CLASS: string;
    static NON_SORTABLE_TH_CLASS: string;
    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected tableConfig: TableUIConfig;
    protected tableBodyEl: HTMLElement | null;
    private stateBuffer;
    private containerEl?;
    private collectionName?;
    private currentPage;
    private observer;
    private currentObservedTarget;
    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler, tableConfig: TableUIConfig);
    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement;
    onDocumentLoaded(): void;
    setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void;
    setDisplayElementsForCollectionInContainerForNextPage(containerEl: HTMLElement, collectionName: string, newState: any): void;
    protected renderNextPage(entries: any): void;
}
