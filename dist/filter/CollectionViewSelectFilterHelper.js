export class CollectionViewSelectFilterHelper {
    constructor(view, filterFieldId, filter) {
        this.selectElement = undefined;
        this.view = view;
        this.filterFieldId = filterFieldId;
        this.filter = filter;
    }
    onDocumentLoaded() {
        this.selectElement = document.getElementById(this.filterFieldId);
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
                        }
                        else {
                            if (this.view.hasFilter()) {
                                this.view.clearFilter();
                            }
                        }
                    }
                }
                else {
                    this.view.clearFilter();
                }
            });
        }
    }
}
//# sourceMappingURL=CollectionViewSelectFilterHelper.js.map