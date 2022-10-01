import {View} from "../view/interface/View";
import {CollectionViewListener} from "../view/interface/CollectionViewListener";
import debug from 'debug';
import {CollectionView} from "../view/interface/CollectionView";
import {ViewContainer} from "./ViewContainer";
import {ContainerVisibilityListener} from "./ContainerVisibilityListener";
import {SidebarLocation, SidebarPrefs, SidebarViewConfig} from "../ConfigurationTypes";
import {browserUtil} from "browser-state-management";


const sbvcLogger = debug('sidebar-container');

export class SidebarViewContainer implements CollectionViewListener, ViewContainer {
    protected prefs: SidebarPrefs;
    protected views: View[];
    protected bIsShowing: boolean = false;
    protected listeners: ContainerVisibilityListener[] = [];

    public constructor(prefs: SidebarPrefs) {
        this.prefs = prefs;
        this.views = [];
        // event handlers
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
    }

    addVisibilityListener(listener: ContainerVisibilityListener): void {
        this.listeners.push(listener);
    }

    addListener(listener: ContainerVisibilityListener): void {
        throw new Error("Method not implemented.");
    }

    public isShowing(): boolean {
        return this.bIsShowing;
    }

    public addView(view: View, config: SidebarViewConfig) {
        sbvcLogger(`Adding view to container, with containing div of ${config.containerId}`);
        const viewContainer = document.getElementById(config.containerId);
        if (viewContainer) {
            sbvcLogger(`Adding view to container, with containing div of ${config.containerId} - FOUND`);
            view.setContainedBy(viewContainer);
        }
        this.views.push(view);
        view.addEventListener(this);
    }


    public onDocumentLoaded() { // this should be called once at startup
        // hide the side bar panel
        this.hide();
        this.listeners.forEach((listener) => listener.nowHidden(this));

        // add the event listener for the close button
        const sidePanelEl = document.getElementById(this.prefs.id);
        if (sidePanelEl === null) return;

        const closeButtonEl = sidePanelEl.querySelector('.close');
        if (closeButtonEl) {
            closeButtonEl.addEventListener('click', this.hide);
        }

        this.views.forEach((view) => {
            view.onDocumentLoaded();
        })
    }

    public hide() {
        this.showHide('0%');
        this.views.forEach((view) => {
            view.hide();
        })
        this.bIsShowing = false;
        this.listeners.forEach((listener) => listener.nowHidden(this));
    }

    public show() {//414,768,1024
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
        console.log(`size: ${size}, agent: ${navigator.userAgent}`);
        this.showHide(size);
        this.views.forEach((view) => {
            view.show();
        })
        this.bIsShowing = true;
        this.listeners.forEach((listener) => listener.nowShowing(this));
    }

    documentLoaded(view: View): void {
    }

    itemAction(view: View, actionName: string, selectedItem: any): void {
    }

    canDeleteItem(view: View, selectedItem: any): boolean {
        return true;
    }

    itemDeleted(view: View, selectedItem: any): void {
    }

    itemDragStarted(view: View, selectedItem: any): void {
    }

    itemSelected(view: View, selectedItem: any): void {
    }

    itemDeselected(view: View, selectedItem: any): void {
    }

    itemDropped(view: View, droppedItem: any): void {
    }

    showRequested(view: View): void {
        this.show();
    }

    /*
      Contained views can request show and hide of the sidebar container
     */

    hideRequested(view: View): void {
        this.hide();
    }

    canSelectItem(view: CollectionView, selectedItem: any): boolean {
        return true;
    }

    collectionChanged(view: CollectionView): void {

    }

    private showHide(newStyleValue: string): void {
        const sidePanelEl = document.getElementById(this.prefs.id);
        if (sidePanelEl === null) return;

        switch (this.prefs.location) {
            case SidebarLocation.left: {
                sidePanelEl.style.width = newStyleValue;
                break;
            }
            case SidebarLocation.right: {
                sidePanelEl.style.width = newStyleValue;
                break;
            }
            case SidebarLocation.bottom: {
                sidePanelEl.style.height = newStyleValue;
                break;
            }
            case SidebarLocation.top: {
                sidePanelEl.style.height = newStyleValue;
                break;
            }
        }
    }

}

