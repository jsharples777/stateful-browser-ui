export class SidebarManager {
    constructor() {
        this.sidebars = [];
        this.mainDivId = 'root';
    }
    static getInstance() {
        if (!(SidebarManager._instance)) {
            SidebarManager._instance = new SidebarManager();
        }
        return SidebarManager._instance;
    }
    setMainDivId(mainDivId) {
        this.mainDivId = mainDivId;
    }
    addSidebar(name, sidebar, location) {
        this.sidebars.push({ name, sidebar, location, isShowing: false });
        sidebar.setMainDivId(this.mainDivId);
    }
    showSidebar(name, pushContentOver = false) {
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
    hideSidebar(name) {
        const foundIndex = this.sidebars.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.sidebars[foundIndex];
            config.sidebar.hide();
            config.isShowing = false;
        }
    }
    isSidebarVisible(name) {
        let result = false;
        const foundIndex = this.sidebars.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.sidebars[foundIndex];
            result = config.sidebar.isShowing();
        }
        return result;
    }
    toggleSidebar(name, pushContent = false) {
        let result = false;
        const foundIndex = this.sidebars.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.sidebars[foundIndex];
            const sidebarState = config.sidebar.isShowing();
            if (sidebarState) {
                this.hideSidebar(name);
            }
            else {
                this.showSidebar(name, pushContent);
            }
            result = config.isShowing;
        }
        return result;
    }
}
//# sourceMappingURL=SidebarManager.js.map