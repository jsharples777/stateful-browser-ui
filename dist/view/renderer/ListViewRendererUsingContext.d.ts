import { CollectionViewRenderer } from "../interface/CollectionViewRenderer";
import { CollectionViewEventHandler } from "../interface/CollectionViewEventHandler";
import { CollectionView } from "../interface/CollectionView";
import { ListViewRuntimeConfig } from "../../ConfigurationTypes";
export declare class ListViewRendererUsingContext implements CollectionViewRenderer {
    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected runtimeConfig: ListViewRuntimeConfig | undefined;
    private stateBuffer;
    private containerEl?;
    private collectionName?;
    private currentPage;
    private observer;
    private currentObservedTarget;
    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler, runtimeConfig?: ListViewRuntimeConfig);
    createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement;
    setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void;
    setDisplayElementsForCollectionInContainerForNextPage(containerEl: HTMLElement, collectionName: string, newState: any): void;
    onDocumentLoaded(): void;
    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    protected renderNextPage(entries: any): void;
}
