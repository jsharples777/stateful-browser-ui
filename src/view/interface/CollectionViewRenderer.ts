export interface CollectionViewRenderer {
    createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement;

    setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void;

    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;

    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;

    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void;


    onDocumentLoaded(): void;
}
