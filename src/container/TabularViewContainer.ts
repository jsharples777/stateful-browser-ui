import {View} from "../view/interface/View";
import debug from 'debug';
import {TabularViewListener} from "./TabularViewListener";

import {ViewContainer} from "./ViewContainer";
import {ContainerVisibilityListener} from "./ContainerVisibilityListener";
import {EXTRA_ACTION_ATTRIBUTE_NAME, TabularViewDOMConfig} from "../ConfigurationTypes";
import {browserUtil, DocumentLoaded} from "browser-state-management";

const logger = debug('tabular-view-container');

type TabView = {
    tabId: string,
    view: View
}

type TabTabElement = {
    tabId: string,
    tabElement: HTMLElement;
}

export class TabularViewContainer implements ViewContainer, DocumentLoaded {
    protected config: TabularViewDOMConfig;
    protected views: TabView[];
    protected tabs: TabTabElement[];
    protected listeners: TabularViewListener[];
    protected viewListeners: ContainerVisibilityListener[] = [];
    protected tabElements: HTMLElement[];
    protected tabViewElements: HTMLElement[];
    protected descriptionElement: HTMLElement | undefined;
    protected currentTabId: string = '';
    protected isVisible: boolean = false;

    public constructor(config: TabularViewDOMConfig) {
        this.config = config;
        this.views = [];
        this.tabs = [];
        this.listeners = [];
        this.tabElements = [];
        this.tabViewElements = [];
        this.handleTabClicked = this.handleTabClicked.bind(this);
    }

    public addListener(listener: TabularViewListener): void {
        this.listeners.push(listener);
    }

    addVisibilityListener(listener: ContainerVisibilityListener): void {
        this.viewListeners.push(listener);
    }


    public addViewToTab(tabId: string, view: View) {
        logger(`Adding view to tabular view, with containing tab of ${tabId}`);
        const foundIndex = this.config.tabs.findIndex((tab) => tab.id === tabId);
        if (foundIndex >= 0) {
            this.views.push({tabId: tabId, view: view});
        }
    }

    public onDocumentLoaded() {
        logger(`On document loaded`);
        const containedByEl = document.getElementById(this.config.containedById);
        if (containedByEl === null) return;

        logger(`Found contained by ${this.config.containedById} constructing elements`);

        // construct the tab view container and sub containers
        let tabViewContainerEl = document.createElement(this.config.tabularViewContainer.type);
        browserUtil.addAttributes(tabViewContainerEl, this.config.tabularViewContainer.attributes);
        browserUtil.addClasses(tabViewContainerEl, this.config.tabularViewContainer.classes);
        browserUtil.addAttributes(tabViewContainerEl, [{name: 'id', value: this.config.containerId}]);

        // construct the titlebar container
        let titleBarContainerEl = document.createElement(this.config.titleBarContainer.type);
        browserUtil.addAttributes(titleBarContainerEl, this.config.titleBarContainer.attributes);
        browserUtil.addClasses(titleBarContainerEl, this.config.titleBarContainer.classes);
        tabViewContainerEl.append(titleBarContainerEl);

        // construct the item description container
        this.descriptionElement = document.createElement(this.config.itemDescriptionContainer.type);
        browserUtil.addAttributes(this.descriptionElement, this.config.itemDescriptionContainer.attributes);
        browserUtil.addClasses(this.descriptionElement, this.config.itemDescriptionContainer.classes);
        browserUtil.addAttributes(this.descriptionElement, [{
            name: 'id',
            value: `${this.config.containerId}.description`
        }]);
        titleBarContainerEl.append(this.descriptionElement);

        // extra actions?
        if (this.config.titleBarActions) {
            let buttonContainerEl = titleBarContainerEl;
            if (this.config.titleBarActionsContainer) {
                let titleBarActionsContainerEl = document.createElement(this.config.titleBarActionsContainer.type);
                browserUtil.addAttributes(titleBarActionsContainerEl, this.config.titleBarActionsContainer.attributes);
                browserUtil.addClasses(titleBarActionsContainerEl, this.config.titleBarActionsContainer.classes);
                titleBarContainerEl.append(titleBarActionsContainerEl);
                buttonContainerEl = titleBarActionsContainerEl;
            }

            this.config.titleBarActions.forEach((extraAction) => {
                let action: HTMLElement = document.createElement('button');
                action.setAttribute('type', 'button');
                browserUtil.addClasses(action, extraAction.button.classes);
                browserUtil.addAttributes(action, extraAction.button.attributes);
                if (extraAction.button.text) {
                    action.innerHTML = extraAction.button.text;
                }
                if (extraAction.button.iconClasses) {
                    let iconEl = document.createElement('i');
                    browserUtil.addClasses(iconEl, extraAction.button.iconClasses);
                    iconEl.setAttribute(EXTRA_ACTION_ATTRIBUTE_NAME, extraAction.name);
                    action.appendChild(iconEl);
                }
                action.setAttribute(EXTRA_ACTION_ATTRIBUTE_NAME, extraAction.name);

                action.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.listeners.forEach((listener) => listener.titleBarAction(this, extraAction.name))
                });
                buttonContainerEl.appendChild(action);
            });
        }

        // construct the tabs
        let tabBarContainerEl = document.createElement(this.config.tabBarContainer.type);
        browserUtil.addAttributes(tabBarContainerEl, this.config.tabBarContainer.attributes);
        browserUtil.addClasses(tabBarContainerEl, this.config.tabBarContainer.classes);
        tabViewContainerEl.append(tabBarContainerEl);

        let tabBarEl = document.createElement(this.config.tabBarElement.type);
        browserUtil.addAttributes(tabBarEl, this.config.tabBarElement.attributes);
        browserUtil.addClasses(tabBarEl, this.config.tabBarElement.classes);
        tabBarContainerEl.appendChild(tabBarEl);

        // create each item and add event handlers
        this.config.tabs.forEach((tab) => {
            logger(`Constructing tab ${tab.id} `);
            let tabEl = document.createElement(tab.element.type);
            browserUtil.addAttributes(tabEl, tab.element.attributes);
            browserUtil.addClasses(tabEl, tab.element.classes);

            tabBarEl.appendChild(tabEl);
            if (tab.subElement) {
                let subTabEl = document.createElement(tab.subElement.type);
                browserUtil.addAttributes(subTabEl, tab.subElement.attributes);
                browserUtil.addClasses(subTabEl, tab.subElement.classes);
                browserUtil.addAttributes(subTabEl, [{name: 'id', value: `${this.config.containerId}.tab.${tab.id}`}]);
                tabEl.appendChild(subTabEl);
                if (tab.subElement.innerHTML) subTabEl.innerHTML = tab.subElement.innerHTML;
                subTabEl.addEventListener('click', this.handleTabClicked);
                if (tab.isDefaultActive) {
                    browserUtil.addAttributes(subTabEl, [{name: 'active', value: 'true'}]);
                    browserUtil.addClasses(subTabEl, 'active');
                } else {
                    browserUtil.removeAttributes(subTabEl, ['active']);
                    browserUtil.removeClasses(subTabEl, 'active');
                }
                this.tabElements.push(subTabEl);
                this.tabs.push({tabId: tab.id, tabElement: subTabEl});
            } else {
                if (tab.element.innerHTML) tabEl.innerHTML = tab.element.innerHTML;
                browserUtil.addAttributes(tabEl, [{name: 'id', value: `${this.config.containerId}.tab.${tab.id}`}]);
                tabEl.addEventListener('click', this.handleTabClicked);
                if (tab.isDefaultActive) {
                    browserUtil.addAttributes(tabEl, [{name: 'active', value: 'true'}]);
                    browserUtil.addClasses(tabEl, 'active');
                } else {
                    browserUtil.removeAttributes(tabEl, ['active']);
                    browserUtil.removeClasses(tabEl, 'active');
                }
                this.tabElements.push(tabEl);
                this.tabs.push({tabId: tab.id, tabElement: tabEl});
            }


        });

        containedByEl.appendChild(tabViewContainerEl);

        // create the view containers and let the views know what contains them
        this.config.tabs.forEach((tab) => {
            logger(`Constructing tab ${tab.id} view`);

            // find the view and let it know about the containing element
            const foundIndex = this.views.findIndex((tabView) => tabView.tabId === tab.id);
            let view: View | null = null;
            if (foundIndex >= 0) {
                view = this.views[foundIndex].view;
            }

            let tabViewEl = document.createElement(this.config.tabViewContainer.type);
            browserUtil.addAttributes(tabViewEl, this.config.tabViewContainer.attributes);
            browserUtil.addClasses(tabViewEl, this.config.tabViewContainer.classes);
            browserUtil.addAttributes(tabViewEl, [{name: 'id', value: `${this.config.containerId}.view.${tab.id}`}]);
            tabViewContainerEl.appendChild(tabViewEl);

            if (view) {
                view.setContainedBy(tabViewEl);
                view.onDocumentLoaded();
            }


            if (tab.isDefaultActive) {
                browserUtil.removeClasses(tabViewEl, 'd-none');
                if (view) view.show();
                this.currentTabId = tab.id;
            } else {
                browserUtil.addClasses(tabViewEl, 'd-none');
                if (view) view.hide();
            }

            this.tabViewElements.push(tabViewEl);
        });

    }

    public setDescription(description: string): void {
        if (this.descriptionElement) {
            this.descriptionElement.innerHTML = description;
        }
    }

    public selectTab(tabId: string): void {
        this.currentTabId = tabId;
        this.tabElements.forEach((tabElement, index) => {
            const tabViewElement = this.tabViewElements[index];


            let tabElementId = tabElement.getAttribute('id');
            if (tabElementId) {
                const idComponents = tabElementId.split('.');
                const tabIdForTabElement = idComponents[idComponents.length - 1];
                const foundIndex = this.views.findIndex((tabView) => tabView.tabId === tabIdForTabElement);
                let view: View | null = null;
                if (foundIndex >= 0) {
                    view = this.views[foundIndex].view;
                }

                if (tabElementId) {
                    if (tabIdForTabElement === tabId) {
                        // mark the tab as active and let the view know
                        browserUtil.addAttributes(tabElement, [{name: 'active', value: 'true'}]);
                        browserUtil.removeClasses(tabViewElement, 'd-none');
                        browserUtil.addClasses(tabElement, 'active');
                        if (view) view.show();
                    } else {
                        browserUtil.removeAttributes(tabElement, ['active']);
                        browserUtil.addClasses(tabViewElement, 'd-none');
                        browserUtil.removeClasses(tabElement, 'active');
                        if (view) view.hide();
                    }
                }
            }

        });
    }

    public show() {
        logger('TVC show');
        this.isVisible = true;
        this.selectTab(this.currentTabId);
        this.viewListeners.forEach((listener) => listener.nowShowing(this));
    }

    public hide() {
        logger('TVC hide');
        this.isVisible = false;
        this.views.forEach((view) => {
            view.view.hide();
        });
        this.viewListeners.forEach((listener) => listener.nowHidden(this));

    }

    isShowing(): boolean {
        return false;
    }

    protected handleTabClicked(event: Event) {
        logger(`handling tab clicked`);
        event.stopPropagation();
        event.preventDefault();

        if (event.target) {
            const targetEl = <HTMLElement>(event.target);
            const targetId: string | null = targetEl.getAttribute('id');
            const targetActive: string | null = targetEl.getAttribute('active');
            logger(`Tab ${targetId} with active status ${targetActive}`);
            if (targetId) {
                const idComponents = targetId.split('.');
                const tabId = idComponents[idComponents.length - 1];
                logger(`tab id ${tabId} has been clicked`);

                if (targetActive) {
                    logger(`tab ${targetId} is already active - doing nothing`);
                } else {
                    logger(`tab ${targetId} is not active - setting active and letting the views know`);
                    this.selectTab(tabId);
                }

                // let the listeners know
                this.listeners.forEach((listener) => listener.tabChanged(this, tabId));
            }
        }
    }


}
