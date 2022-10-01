import {SidebarViewContainer} from '../container/SidebarViewContainer';
import {ChatLogsView} from "./ChatLogsView";
import {ChatLogDetailView} from "./ChatLogDetailView";
import {SidebarLocation, SidebarPrefs} from "../ConfigurationTypes";
import {StateManager} from "browser-state-management";

export class ChatRoomsSidebar extends SidebarViewContainer {
    static SidebarPrefs: SidebarPrefs = {
        id: 'chatSideBar',
        expandedSize: '35%',
        location: SidebarLocation.right
    }
    static SidebarContainers = {
        chatLogs: 'chatLogs',
        chatLog: 'chatLogRoom'
    }
    private static _instance: ChatRoomsSidebar;

    private constructor(stateManager: StateManager) {
        super(ChatRoomsSidebar.SidebarPrefs);
        const chatView = ChatLogsView.getInstance();
        this.addView(chatView, {containerId: ChatRoomsSidebar.SidebarContainers.chatLogs});

        const chatLogView = ChatLogDetailView.getInstance(stateManager);
        this.addView(chatLogView, {containerId: ChatRoomsSidebar.SidebarContainers.chatLog});
        chatView.addEventListener(chatLogView);
    }

    public static getInstance(stateManager: StateManager): ChatRoomsSidebar {
        if (!(ChatRoomsSidebar._instance)) {
            ChatRoomsSidebar._instance = new ChatRoomsSidebar(stateManager);
        }
        return ChatRoomsSidebar._instance;
    }
}


