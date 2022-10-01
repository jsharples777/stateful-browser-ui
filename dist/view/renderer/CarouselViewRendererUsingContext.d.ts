import { CollectionViewRenderer } from "../interface/CollectionViewRenderer";
import { CollectionView } from "../interface/CollectionView";
import { CollectionViewEventHandler } from "../interface/CollectionViewEventHandler";
import { CarouselDOMConfig } from "../../ConfigurationTypes";
export declare class CarouselViewRendererUsingContext implements CollectionViewRenderer {
    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected config: CarouselDOMConfig;
    private lastRenderedContainer;
    private lastRenderedCollectionName;
    private lastRenderedCollection;
    private previousWindowWidth;
    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler, config: CarouselDOMConfig);
    onDocumentLoaded(): void;
    createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement;
    setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void;
    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;
}
