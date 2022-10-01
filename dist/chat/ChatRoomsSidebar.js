import { SidebarViewContainer } from '../container/SidebarViewContainer';
import { ChatLogsView } from "./ChatLogsView";
import { ChatLogDetailView } from "./ChatLogDetailView";
import { SidebarLocation } from "../ConfigurationTypes";
export class ChatRoomsSidebar extends SidebarViewContainer {
    constructor(stateManager) {
        super(ChatRoomsSidebar.SidebarPrefs);
        const chatView = ChatLogsView.getInstance();
        this.addView(chatView, { containerId: ChatRoomsSidebar.SidebarContainers.chatLogs });
        const chatLogView = ChatLogDetailView.getInstance(stateManager);
        this.addView(chatLogView, { containerId: ChatRoomsSidebar.SidebarContainers.chatLog });
        chatView.addEventListener(chatLogView);
    }
    static getInstance(stateManager) {
        if (!(ChatRoomsSidebar._instance)) {
            ChatRoomsSidebar._instance = new ChatRoomsSidebar(stateManager);
        }
        return ChatRoomsSidebar._instance;
    }
}
ChatRoomsSidebar.SidebarPrefs = {
    id: 'chatSideBar',
    expandedSize: '35%',
    location: SidebarLocation.right
};
ChatRoomsSidebar.SidebarContainers = {
    chatLogs: 'chatLogs',
    chatLog: 'chatLogRoom'
};
//# sourceMappingURL=ChatRoomsSidebar.js.map