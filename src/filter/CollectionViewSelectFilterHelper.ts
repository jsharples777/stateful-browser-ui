import {CollectionFilter, DocumentLoaded} from "browser-state-management";
import {CollectionView} from "../view/interface/CollectionView";



export class CollectionViewSelectFilterHelper implements DocumentLoaded {
    protected view: CollectionView;
    protected filterFieldId: string;
    protected selectElement: HTMLSelectElement|undefined = undefined;
    private filter: CollectionFilter;

    constructor(view: CollectionView, filterFieldId: string, filter: CollectionFilter) {
        this.view = view;
        this.filterFieldId = filterFieldId;
        this.filter = filter;
    }

    onDocumentLoaded(): void {
        this.selectElement = <HTMLSelectElement>document.getElementById(this.filterFieldId);
        if (this.selectElement) {
            this.selectElement.addEventListener('change', (event) => {
                // @ts-ignore
                const value = this.selectElement.value;
                if (value) {
                    // @ts-ignore
                    const filterValue = value.trim();
                    if (this.filter.contains.length > 0) {
                        if (filterValue.length >= this.filter.contains[0].minLength) {
                            this.filter.contains[0].filter = filterValue;
                            this.view.applyFilter(this.filter);
                        } else {
                            if (this.view.hasFilter()) {
                                this.view.clearFilter();
                            }
                        }

                    }

                } else {
                    this.view.clearFilter();
                }
            });
        }
    }
}
