export class CollectionViewFilterHelper {
    constructor(view, filterFieldId, filter) {
        this.view = view;
        this.filterFieldId = filterFieldId;
        this.filter = filter;
        this.filterEl = null;
    }
    addPartialMatch(filter, matchingFieldIds, minLength) {
        this.filter.contains.push({ filter, matchingFieldIds, minLength });
    }
    clearPartialMatch() {
        this.filter.contains = [];
    }
    addExactMatch(fieldId, values) {
        this.filter.exactMatch.push({ matchingFieldId: fieldId, matchValues: values, isStrictMatch: false });
    }
    clearExactMatch() {
        this.filter.exactMatch = [];
    }
    applyCurrentFilter() {
        this.view.applyFilter(this.filter);
    }
    onDocumentLoaded() {
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
                    }
                    else {
                        if (this.view.hasFilter()) {
                            this.view.clearFilter();
                        }
                    }
                }
            });
        }
    }
}
//# sourceMappingURL=CollectionViewFilterHelper.js.map