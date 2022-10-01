import { SidebarViewContainer } from '../container/SidebarViewContainer';
import { SidebarPrefs } from "../ConfigurationTypes";
import { StateManager } from "browser-state-management";
export declare class UserSearchSidebar extends SidebarViewContainer {
    static SidebarPrefs: SidebarPrefs;
    static SidebarContainers: {
        recentSearches: string;
        favourites: string;
        blocked: string;
    };
    private static _instance;
    private logSB;
    private constructor();
    static getInstance(stateManager: StateManager): UserSearchSidebar;
}
