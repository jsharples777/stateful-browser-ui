import { CollectionView } from "../view/interface/CollectionView";
import { CollectionFilter, DocumentLoaded } from "browser-state-management";
export declare class CollectionViewFilterHelper implements DocumentLoaded {
    protected view: CollectionView;
    protected filterFieldId: string;
    private filter;
    private filterEl;
    constructor(view: CollectionView, filterFieldId: string, filter: CollectionFilter);
    addPartialMatch(filter: string, matchingFieldIds: string[], minLength: number): void;
    clearPartialMatch(): void;
    addExactMatch(fieldId: string, values: any[]): void;
    clearExactMatch(): void;
    applyCurrentFilter(): void;
    onDocumentLoaded(): void;
}
