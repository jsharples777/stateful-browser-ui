import debug from 'debug';
import { SidebarLocation } from "../ConfigurationTypes";
import { browserUtil } from "browser-state-management";
const sbvcLogger = debug('sidebar-container');
export class SidebarViewContainer {
    constructor(prefs) {
        this.bIsShowing = false;
        this.listeners = [];
        this.mainDivId = 'root';
        this.prefs = prefs;
        this.views = [];
        // event handlers
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
    }
    addVisibilityListener(listener) {
        this.listeners.push(listener);
    }
    addListener(listener) {
        throw new Error("Method not implemented.");
    }
    isShowing() {
        return this.bIsShowing;
    }
    addView(view, config) {
        sbvcLogger(`Adding view to container, with containing div of ${config.containerId}`);
        const viewContainer = document.getElementById(config.containerId);
        if (viewContainer) {
            sbvcLogger(`Adding view to container, with containing div of ${config.containerId} - FOUND`);
            view.setContainedBy(viewContainer);
        }
        this.views.push(view);
        view.addEventListener(this);
    }
    setMainDivId(mainDivId) {
        this.mainDivId = mainDivId;
    }
    onDocumentLoaded() {
        // hide the side bar panel
        this.hide();
        this.listeners.forEach((listener) => listener.nowHidden(this));
        // add the event listener for the close button
        const sidePanelEl = document.getElementById(this.prefs.id);
        if (sidePanelEl === null)
            return;
        const closeButtonEl = sidePanelEl.querySelector('.close');
        if (closeButtonEl) {
            closeButtonEl.addEventListener('click', this.hide);
        }
        this.views.forEach((view) => {
            view.onDocumentLoaded();
        });
    }
    hide() {
        this.showHide('0%', true);
        this.views.forEach((view) => {
            view.hide();
        });
        this.bIsShowing = false;
        this.listeners.forEach((listener) => listener.nowHidden(this));
    }
    show(pushContent = false) {
        let size = this.prefs.expandedSize;
        if (window.outerWidth < 769) {
            size = '50%';
        }
        if (window.outerWidth < 415) {
            size = '100%';
        }
        if (browserUtil.isMobileDevice()) {
            size = '100%';
        }
        sbvcLogger(`size: ${size}, agent: ${navigator.userAgent}`);
        this.showHide(size, pushContent);
        this.views.forEach((view) => {
            view.show();
        });
        this.bIsShowing = true;
        this.listeners.forEach((listener) => listener.nowShowing(this));
    }
    documentLoaded(view) {
    }
    itemAction(view, actionName, selectedItem) {
    }
    canDeleteItem(view, selectedItem) {
        return true;
    }
    itemDeleted(view, selectedItem) {
    }
    itemDragStarted(view, selectedItem) {
    }
    itemSelected(view, selectedItem) {
    }
    itemDeselected(view, selectedItem) {
    }
    itemDropped(view, droppedItem) {
    }
    showRequested(view) {
        this.show();
    }
    /*
      Contained views can request show and hide of the sidebar container
     */
    hideRequested(view) {
        this.hide();
    }
    canSelectItem(view, selectedItem) {
        return true;
    }
    collectionChanged(view) {
    }
    pushContent(mainPanelEl, newStyleValue, pushContent) {
        if (pushContent) {
            if (mainPanelEl) {
                switch (this.prefs.location) {
                    case SidebarLocation.left: {
                        mainPanelEl.style.marginLeft = newStyleValue;
                        break;
                    }
                    case SidebarLocation.right: {
                        mainPanelEl.style.marginRight = newStyleValue;
                        break;
                    }
                    case SidebarLocation.top: {
                        mainPanelEl.style.marginTop = newStyleValue;
                        break;
                    }
                    case SidebarLocation.bottom: {
                        mainPanelEl.style.marginBottom = newStyleValue;
                        break;
                    }
                }
            }
        }
    }
    showHide(newStyleValue, pushContent = false) {
        const sidePanelEl = document.getElementById(this.prefs.id);
        const mainPanelEl = document.getElementById(this.mainDivId);
        if (sidePanelEl === null)
            return;
        switch (this.prefs.location) {
            case SidebarLocation.left: {
                sidePanelEl.style.width = newStyleValue;
                this.pushContent(mainPanelEl, newStyleValue, pushContent);
                break;
            }
            case SidebarLocation.right: {
                sidePanelEl.style.width = newStyleValue;
                this.pushContent(mainPanelEl, newStyleValue, pushContent);
                break;
            }
            case SidebarLocation.bottom: {
                sidePanelEl.style.height = newStyleValue;
                this.pushContent(mainPanelEl, newStyleValue, pushContent);
                break;
            }
            case SidebarLocation.top: {
                sidePanelEl.style.height = newStyleValue;
                this.pushContent(mainPanelEl, newStyleValue, pushContent);
                break;
            }
        }
    }
}
//# sourceMappingURL=SidebarViewContainer.js.map