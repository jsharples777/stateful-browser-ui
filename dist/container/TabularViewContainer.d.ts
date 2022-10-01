import { View } from "../view/interface/View";
import { TabularViewListener } from "./TabularViewListener";
import { ViewContainer } from "./ViewContainer";
import { ContainerVisibilityListener } from "./ContainerVisibilityListener";
import { TabularViewDOMConfig } from "../ConfigurationTypes";
import { DocumentLoaded } from "browser-state-management";
declare type TabView = {
    tabId: string;
    view: View;
};
declare type TabTabElement = {
    tabId: string;
    tabElement: HTMLElement;
};
export declare class TabularViewContainer implements ViewContainer, DocumentLoaded {
    protected config: TabularViewDOMConfig;
    protected views: TabView[];
    protected tabs: TabTabElement[];
    protected listeners: TabularViewListener[];
    protected viewListeners: ContainerVisibilityListener[];
    protected tabElements: HTMLElement[];
    protected tabViewElements: HTMLElement[];
    protected descriptionElement: HTMLElement | undefined;
    protected currentTabId: string;
    protected isVisible: boolean;
    constructor(config: TabularViewDOMConfig);
    addListener(listener: TabularViewListener): void;
    addVisibilityListener(listener: ContainerVisibilityListener): void;
    addViewToTab(tabId: string, view: View): void;
    onDocumentLoaded(): void;
    setDescription(description: string): void;
    selectTab(tabId: string): void;
    show(): void;
    hide(): void;
    isShowing(): boolean;
    protected handleTabClicked(event: Event): void;
}
export {};
