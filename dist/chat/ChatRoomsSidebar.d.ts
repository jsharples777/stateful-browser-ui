import { SidebarViewContainer } from '../container/SidebarViewContainer';
import { SidebarPrefs } from "../ConfigurationTypes";
import { StateManager } from "browser-state-management";
export declare class ChatRoomsSidebar extends SidebarViewContainer {
    static SidebarPrefs: SidebarPrefs;
    static SidebarContainers: {
        chatLogs: string;
        chatLog: string;
    };
    private static _instance;
    private constructor();
    static getInstance(stateManager: StateManager): ChatRoomsSidebar;
}
