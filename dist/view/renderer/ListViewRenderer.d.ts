import { CollectionViewRenderer } from "../interface/CollectionViewRenderer";
import { CollectionView } from "../interface/CollectionView";
import { CollectionViewEventHandler } from "../interface/CollectionViewEventHandler";
import { CollectionRendererHelper } from "./CollectionRendererHelper";
export declare class ListViewRenderer implements CollectionViewRenderer {
    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected helper: CollectionRendererHelper;
    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler);
    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement;
    setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void;
    onDocumentLoaded(): void;
}
