import { CollectionView } from "../interface/CollectionView";
import { CollectionViewRenderer } from "../interface/CollectionViewRenderer";
export declare class CollectionRendererHelper {
    private renderer;
    private view;
    constructor(view: CollectionView, renderer: CollectionViewRenderer);
    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
}
