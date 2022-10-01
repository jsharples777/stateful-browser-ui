import {CollectionView} from "../view/interface/CollectionView";
import {CollectionFilter, DocumentLoaded} from "browser-state-management";

export class CollectionViewFilterHelper implements DocumentLoaded {
    protected view: CollectionView;
    protected filterFieldId: string;
    private filter: CollectionFilter;
    private filterEl: HTMLElement | null;

    constructor(view: CollectionView, filterFieldId: string, filter: CollectionFilter) {
        this.view = view;
        this.filterFieldId = filterFieldId;
        this.filter = filter;
        this.filterEl = null;
    }

    public addPartialMatch(filter: string, matchingFieldIds: string[], minLength: number): void {
        this.filter.contains.push({filter, matchingFieldIds, minLength})
    }

    public clearPartialMatch(): void {
        this.filter.contains = [];
    }

    public addExactMatch(fieldId: string, values: any[]): void {
        this.filter.exactMatch.push({matchingFieldId: fieldId, matchValues: values, isStrictMatch: false});
    }

    public clearExactMatch(): void {
        this.filter.exactMatch = [];
    }

    public applyCurrentFilter(): void {
        this.view.applyFilter(this.filter);
    }

    onDocumentLoaded(): void {
        this.filterEl = document.getElementById(this.filterFieldId);
        if (this.filterEl) {
            this.filterEl.addEventListener('keyup', (event) => {
                if (event.isComposing || event.keyCode === 229) {
                    return;
                }
                if (this.filter.contains.length > 0) {
                    // @ts-ignore
                    const filterValue = this.filterEl.value.trim();
                    if (filterValue.length >= this.filter.contains[0].minLength) {
                        this.filter.contains[0].filter = filterValue;
                        this.view.applyFilter(this.filter);
                    } else {
                        if (this.view.hasFilter()) {
                            this.view.clearFilter();
                        }
                    }
                }
            });
        }
    }
}
