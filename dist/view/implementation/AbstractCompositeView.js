import { ViewLinkerHelper } from "../../view-linker/ViewLinkerHelper";
import { ItemEventType } from "../../CommonTypes";
export class AbstractCompositeView {
    constructor() {
        this.isVisible = false;
        this.hasFirstRender = false;
        this.isExecutingModify = false;
        this.itemViewEvent = this.itemViewEvent.bind(this);
    }
    itemViewHasChanged(name) {
    }
    hide() {
        this.isVisible = false;
        //this.listView.hide();
        //this.detailView.hide();
    }
    isShowing() {
        return this.isVisible;
    }
    show() {
        this.isVisible = true;
        if (!this.hasFirstRender) {
            this.hasFirstRender = true;
            this.listView.show();
            this.listView.render();
        }
    }
    itemViewEvent(name, event, rowValues) {
        switch (event.eventType) {
            case ItemEventType.MODIFYING: {
                if (!this.isExecutingModify) {
                    this.isExecutingModify = true;
                    this.stateManager.updateItemInState(this.stateName, rowValues, false);
                    this.isExecutingModify = false;
                }
                break;
            }
        }
        return false;
    }
    setupViewLinker(config) {
        this.stateManager = config.stateManager;
        this.stateName = config.dataObjectName;
        const result = ViewLinkerHelper.getInstance().onDocumentLoaded(config);
        // @ts-ignore
        this.form = result.form;
        // @ts-ignore
        this.listView = result.listView;
        // @ts-ignore
        this.detailView = result.detailView;
        // @ts-ignore
        this.linker = result.linker;
        this.form.addListener(this);
    }
}
//# sourceMappingURL=AbstractCompositeView.js.map