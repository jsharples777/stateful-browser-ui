import { CollectionFilter, DocumentLoaded } from "browser-state-management";
import { CollectionView } from "../view/interface/CollectionView";
export declare class CollectionViewSelectFilterHelper implements DocumentLoaded {
    protected view: CollectionView;
    protected filterFieldId: string;
    protected selectElement: HTMLSelectElement | undefined;
    private filter;
    constructor(view: CollectionView, filterFieldId: string, filter: CollectionFilter);
    onDocumentLoaded(): void;
}
