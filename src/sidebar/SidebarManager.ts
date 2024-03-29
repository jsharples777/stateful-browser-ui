import {SidebarViewContainer} from "../container/SidebarViewContainer";
import {SidebarLocation} from "../ConfigurationTypes";


type SidebarLocationItem = {
    name: string,
    sidebar: SidebarViewContainer,
    location: SidebarLocation,
    isShowing: boolean
}

export class SidebarManager {
    private static _instance: SidebarManager;
    private sidebars: SidebarLocationItem[] = [];
    private mainDivId:string = 'root'

    private constructor() {
    }

    public static getInstance(): SidebarManager {
        if (!(SidebarManager._instance)) {
            SidebarManager._instance = new SidebarManager();
        }
        return SidebarManager._instance;
    }

    public setMainDivId(mainDivId:string):void {
        this.mainDivId = mainDivId;
    }

    public addSidebar(name: string, sidebar: SidebarViewContainer, location: SidebarLocation) {
        this.sidebars.push({name, sidebar, location, isShowing: false});
        sidebar.setMainDivId(this.mainDivId);
    }

    public showSidebar(name: string,pushContentOver:boolean = false) {
        const foundIndex = this.sidebars.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.sidebars[foundIndex];
            // find other sidebars in the same location
            this.sidebars.forEach((sidebar) => {
                if (sidebar.location === config.location) {
                    if (sidebar.isShowing) {
                        this.hideSidebar(sidebar.name);
                    }
                }
            });
            config.sidebar.show(pushContentOver);
            config.isShowing = true;
        }
    }

    public hideSidebar(name: string) {
        const foundIndex = this.sidebars.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.sidebars[foundIndex];
            config.sidebar.hide();
            config.isShowing = false;
        }
    }

    public isSidebarVisible(name: string): boolean {
        let result = false;
        const foundIndex = this.sidebars.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.sidebars[foundIndex];
            result = config.sidebar.isShowing();
        }
        return result;
    }

    public toggleSidebar(name: string,pushContent:boolean = false): boolean {

        let result = false;
        const foundIndex = this.sidebars.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.sidebars[foundIndex];
            const sidebarState = config.sidebar.isShowing();
            if (sidebarState) {
                this.hideSidebar(name);
            } else {
                this.showSidebar(name,pushContent)
            }

            result = config.isShowing;
        }
        return result;
    }

}
