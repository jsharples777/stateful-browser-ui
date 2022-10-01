import { SidebarViewContainer } from "../container/SidebarViewContainer";
import { SidebarLocation } from "../ConfigurationTypes";
export declare class SidebarManager {
    private static _instance;
    private sidebars;
    private constructor();
    static getInstance(): SidebarManager;
    addSidebar(name: string, sidebar: SidebarViewContainer, location: SidebarLocation): void;
    showSidebar(name: string): void;
    hideSidebar(name: string): void;
    isSidebarVisible(name: string): boolean;
    toggleSidebar(name: string): boolean;
}
