import {TabularViewContainer} from "./TabularViewContainer";

export interface TabularViewListener {
    tabChanged(tabView: TabularViewContainer, newTabId: string): void;

    titleBarAction(tabView: TabularViewContainer, actionName: string): void;
}
