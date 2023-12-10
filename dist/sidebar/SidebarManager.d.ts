import { SidebarViewContainer } from "../container/SidebarViewContainer";
import { SidebarLocation } from "../ConfigurationTypes";
export declare class SidebarManager {
    private static _instance;
    private sidebars;
    private mainDivId;
    private constructor();
    static getInstance(): SidebarManager;
    setMainDivId(mainDivId: string): void;
    addSidebar(name: string, sidebar: SidebarViewContainer, location: SidebarLocation): void;
    showSidebar(name: string, pushContentOver?: boolean): void;
    hideSidebar(name: string): void;
    isSidebarVisible(name: string): boolean;
    toggleSidebar(name: string): boolean;
}
