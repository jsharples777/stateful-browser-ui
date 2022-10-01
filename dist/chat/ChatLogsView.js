import debug from 'debug';
import { AbstractStatefulCollectionView } from "../view/implementation/AbstractStatefulCollectionView";
import { ListViewRenderer } from "../view/renderer/ListViewRenderer";
import { STATE_NAMES, VIEW_NAME } from "./ChatTypes";
import { Modifier } from "../ConfigurationTypes";
import { ChatManager, isSameRoom, KeyType, MemoryBufferStateManager, NotificationController } from "browser-state-management";
const csLogger = debug('chat-sidebar');
export class ChatLogsView extends AbstractStatefulCollectionView {
    constructor() {
        super(ChatLogsView.DOMConfig, new MemoryBufferStateManager(isSameRoom), STATE_NAMES.chatLogs);
        this.selectedChatLog = null;
        this.renderer = new ListViewRenderer(this, this);
        // handler binding
        this.handleChatLogsUpdated = this.handleChatLogsUpdated.bind(this);
        this.handleChatLogUpdated = this.handleChatLogUpdated.bind(this);
        this.handleChatStarted = this.handleChatStarted.bind(this);
        NotificationController.getInstance().addListener(this);
    }
    static getInstance() {
        if (!(ChatLogsView._instance)) {
            ChatLogsView._instance = new ChatLogsView();
        }
        return ChatLogsView._instance;
    }
    compareItemsForEquality(item1, item2) {
        return isSameRoom(item1, item2);
    }
    handleNewInviteReceived(invite) {
        return true;
    }
    handleChatLogUpdated(log) {
        csLogger(`Handling chat log updates`);
        this.updateStateManager();
    }
    onDocumentLoaded() {
        super.onDocumentLoaded();
        this.addEventCollectionListener(this);
        this.updateStateManager();
    }
    getIdForItemInNamedCollection(name, item) {
        return item.roomName;
    }
    renderDisplayForItemInNamedCollection(containerEl, name, item) {
        containerEl.innerHTML = item.users.join(',');
    }
    getModifierForItemInNamedCollection(name, item) {
        let result = Modifier.inactive;
        if (this.selectedChatLog) {
            if (this.selectedChatLog.roomName === item.roomName) {
                result = Modifier.active;
            }
        }
        return result;
    }
    getSecondaryModifierForItemInNamedCollection(name, item) {
        return this.getModifierForItemInNamedCollection(name, item);
    }
    selectChatRoom(roomName) {
        let room = ChatManager.getInstance().getChatLog(roomName);
        this.selectedChatLog = room;
        this.eventForwarder.itemSelected(this, this.selectedChatLog);
        this.updateStateManager();
    }
    handleChatLogsUpdated() {
        if (this.selectedChatLog) {
            ChatManager.getInstance().touchChatLog(this.selectedChatLog.roomName);
        }
        this.updateStateManager();
    }
    handleChatStarted(log) {
        this.selectedChatLog = log;
        this.eventForwarder.itemSelected(this, this.selectedChatLog);
        this.updateStateManager();
    }
    getBadgeValueForItemInNamedCollection(name, item) {
        return item.unreadMessages + item.unreadHighMessages + item.unreadUrgentMessages;
    }
    canDeleteItem(view, selectedItem) {
        return true;
    }
    itemDeleted(view, selectedItem) {
        csLogger(`Deleting chat ${selectedItem.roomName}`);
        ChatManager.getInstance().leaveChat(selectedItem.roomName);
        if (this.selectedChatLog && (this.selectedChatLog.roomName === selectedItem.roomName)) {
            this.eventForwarder.itemDeselected(this, this.selectedChatLog);
            this.selectedChatLog = null;
        }
        this.updateStateManager();
    }
    hideRequested(view) {
        if (this.selectedChatLog) {
            this.eventForwarder.itemDeselected(this, this.selectedChatLog);
            this.selectedChatLog = null;
        }
    }
    hide() {
        this.hideRequested(this);
    }
    documentLoaded(view) {
    }
    itemAction(view, actionName, selectedItem) {
    }
    itemDragStarted(view, selectedItem) {
    }
    itemDropped(view, droppedItem) {
    }
    itemSelected(view, selectedItem) {
        this.selectedChatLog = selectedItem;
        this.updateStateManager();
    }
    itemDeselected(view, selectedItem) {
        this.selectedChatLog = null;
        this.updateStateManager();
    }
    showRequested(view) {
    }
    handleOfflineMessagesReceived(messages) {
    }
    handleInvitationDeclined(room, username) {
    }
    canSelectItem(view, selectedItem) {
        return true;
    }
    updateStateManager() {
        csLogger(`Updating state with chat manager`);
        let newState = ChatManager.getInstance().getChatLogs();
        csLogger(newState);
        this.stateManager.setStateByName(STATE_NAMES.chatLogs, newState, true);
    }
}
ChatLogsView.DOMConfig = {
    viewConfig: {
        resultsContainerId: 'chatLogs',
        dataSourceId: VIEW_NAME.chatLogs,
    },
    resultsElement: {
        type: 'a',
        attributes: [{ name: 'href', value: '#' }],
        classes: 'list-group-item my-list-item truncate-notification list-group-item-action'
    },
    keyId: 'roomName',
    keyType: KeyType.string,
    modifiers: {
        normal: '',
        inactive: 'list-group-item-dark',
        active: 'list-group-item-primary',
        warning: ''
    },
    detail: {
        containerClasses: 'd-flex w-100 justify-content-between',
        textElement: {
            type: 'span',
            classes: 'mb-1'
        },
        select: true,
        delete: {
            classes: 'btn bg-danger text-white btn-circle btn-sm',
            iconClasses: 'text-black fas fa-sign-out-alt',
        },
        badge: {
            type: 'span',
            classes: 'badge badge-pill badge-primary mr-1',
        }
    },
};
//# sourceMappingURL=ChatLogsView.js.map