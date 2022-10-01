import debug from 'debug';
import moment from "moment";
import { DRAGGABLE, STATE_NAMES, VIEW_NAME } from "./ChatTypes";
import { v4 } from "uuid";
import { FrameworkNotificationSources, NotificationType } from "browser-state-management";
import { ChatManager, NotificationController, NotificationManager, Priority, SecurityManager } from "browser-state-management";
import { browserUtil } from "browser-state-management";
import { DRAGGABLE_KEY_ID, DRAGGABLE_TYPE } from "../CommonTypes";
const csLoggerDetail = debug('chat-sidebar:detail');
export class ChatLogDetailView {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.selectedChatLog = null;
        // handler binding
        this.handleAddMessage = this.handleAddMessage.bind(this);
        this.handleChatLogsUpdated = this.handleChatLogsUpdated.bind(this);
        this.handleChatLogUpdated = this.handleChatLogUpdated.bind(this);
        this.handleChatStarted = this.handleChatStarted.bind(this);
        this.handleUserDrop = this.handleUserDrop.bind(this);
        this.leaveChat = this.leaveChat.bind(this);
        this.eventUserSelected = this.eventUserSelected.bind(this);
        NotificationController.getInstance().addListener(this);
        this.stateManager.addChangeListenerForName(STATE_NAMES.users, this);
    }
    static getInstance(stateManager) {
        if (!(ChatLogDetailView._instance)) {
            ChatLogDetailView._instance = new ChatLogDetailView(stateManager);
        }
        return ChatLogDetailView._instance;
    }
    clearDisplay() {
    }
    isShowing() {
        return true;
    }
    collectionChanged(view) {
    }
    hasActionPermission(actionName, from, item) {
        return true;
    }
    getListenerName() {
        return 'Chat Log Details';
    }
    canSelectItem(view, selectedItem) {
        return true;
    }
    hasPermissionToDeleteItemInNamedCollection(name, item) {
        return true;
    }
    hasPermissionToUpdateItemInNamedCollection(name, item) {
        return true;
    }
    hasChanged() {
        return false;
    }
    setContainedBy(container) {
    }
    addEventListener(listener) {
    }
    getIdForItemInNamedCollection(name, item) {
        throw new Error('Method not implemented.');
    }
    getDisplayValueForItemInNamedCollection(name, item) {
        throw new Error('Method not implemented.');
    }
    compareItemsForEquality(item1, item2) {
        throw new Error('Method not implemented.');
    }
    getModifierForItemInNamedCollection(name, item) {
        throw new Error('Method not implemented.');
    }
    getSecondaryModifierForItemInNamedCollection(name, item) {
        throw new Error('Method not implemented.');
    }
    getBadgeValueForItemInNamedCollection(name, item) {
        throw new Error('Method not implemented.');
    }
    getBackgroundImageForItemInNamedCollection(name, item) {
        throw new Error('Method not implemented.');
    }
    updateViewForNamedCollection(name, newState) {
        throw new Error('Method not implemented.');
    }
    itemDeselected(view, selectedItem) {
        csLoggerDetail(`Chat Log with id ${selectedItem.roomName} deselected`);
        if (this.selectedChatLog && (selectedItem.roomName === this.selectedChatLog.roomName)) {
            this.selectedChatLog = null;
            this.checkCanComment();
            this.clearChatLog();
        }
    }
    itemSelected(view, selectedItem) {
        this.selectedChatLog = selectedItem;
        if (this.selectedChatLog) {
            csLoggerDetail(`Chat Log with id ${selectedItem.roomName} selected`);
            this.checkCanComment();
            this.renderChatLog(this.selectedChatLog);
        }
    }
    canDeleteItem(view, selectedItem) {
        return true;
    }
    itemDeleted(view, selectedItem) {
        csLoggerDetail(`Chat Log with ${selectedItem.roomName} deleting`);
        if (this.selectedChatLog && (this.selectedChatLog.roomName === selectedItem.roomName)) {
            this.checkCanComment();
            this.renderChatLog(this.selectedChatLog);
        }
    }
    hideRequested(view) {
        this.selectedChatLog = null;
        this.checkCanComment();
        this.clearChatLog();
    }
    handleUserDrop(event) {
        csLoggerDetail('drop event on current chat room');
        if (this.selectedChatLog) {
            // @ts-ignore
            const draggedObjectJSON = event.dataTransfer.getData(DRAGGABLE_KEY_ID);
            const draggedObject = JSON.parse(draggedObjectJSON);
            csLoggerDetail(draggedObject);
            if (draggedObject[DRAGGABLE_TYPE] === DRAGGABLE.typeUser) {
                //add the user to the current chat if not already there
                ChatManager.getInstance().sendInvite(draggedObject.username, this.selectedChatLog.roomName);
                const notification = {
                    duration: 5000,
                    id: v4(),
                    message: `Invited ${draggedObject.username} to the chat.`,
                    source: {
                        name: FrameworkNotificationSources.CHAT,
                        id: this.selectedChatLog.roomName
                    },
                    title: 'Chat',
                    type: NotificationType.info
                };
                NotificationManager.getInstance().show(notification);
            }
        }
    }
    handleChatLogUpdated(log) {
        csLoggerDetail(`Handling chat log updates`);
        this.checkCanComment();
        this.renderChatLog(log);
    }
    handleAddMessage(event) {
        event.preventDefault();
        event.stopPropagation();
        csLoggerDetail(`Handling message event`);
        if (this.selectedChatLog) {
            // @ts-ignore
            if (this.commentEl && this.commentEl.value.trim().length === 0)
                return;
            // @ts-ignore
            const messageContent = this.commentEl.value.trim();
            // @ts-ignore
            this.commentEl.value = '';
            const simpleAttachment = { identifier: '', type: '', displayText: '' };
            let sentMessage = ChatManager.getInstance().sendMessage(this.selectedChatLog.roomName, messageContent, Priority.Normal, simpleAttachment, {});
            if (sentMessage) {
                // add the message to our display
                let messageEl = this.addChatMessage(sentMessage);
                // scroll to bottom
                browserUtil.scrollSmoothTo(messageEl);
            }
        }
    }
    onDocumentLoaded() {
        // @ts-ignore
        this.chatLogDiv = document.getElementById(ChatLogDetailView.chatLogId);
        // @ts-ignore
        this.commentEl = document.getElementById(ChatLogDetailView.commentId);
        // @ts-ignore
        this.chatForm = document.getElementById(ChatLogDetailView.newFormId);
        // @ts-ignore
        this.sendMessageButton = document.getElementById(ChatLogDetailView.submitCommentId);
        // @ts-ignore
        this.leaveChatButton = document.getElementById(ChatLogDetailView.leaveChatId);
        // @ts-ignore
        this.chatRoomDiv = document.getElementById(ChatLogDetailView.chatLogRoomId);
        // @ts-ignore
        this.fastUserSearch = document.getElementById(ChatLogDetailView.chatFastSearchUserNames);
        this.chatRoomDiv.addEventListener('dragover', (event) => {
            csLoggerDetail('Dragged over');
            if (this.selectedChatLog)
                event.preventDefault();
        });
        this.chatRoomDiv.addEventListener('drop', this.handleUserDrop);
        this.chatForm.addEventListener('submit', this.handleAddMessage);
        this.leaveChatButton.addEventListener('click', this.leaveChat);
        this.checkCanComment();
        // fast user search
        // @ts-ignore
        const fastSearchEl = $(`#${ChatLogDetailView.chatFastSearchUserNames}`);
        // @ts-ignore
        fastSearchEl.on('autocompleteselect', this.eventUserSelected);
    }
    eventUserSelected(event, ui) {
        event.preventDefault();
        event.stopPropagation();
        csLoggerDetail(`User ${ui.item.label} with id ${ui.item.value} selected`);
        // @ts-ignore
        event.target.innerText = '';
        // add to the chat, if one selected
        if (this.selectedChatLog)
            ChatManager.getInstance().sendInvite(ui.item.label, this.selectedChatLog.roomName);
        const notification = {
            duration: 5000,
            id: v4(),
            message: `Invited ${ui.item.label} to the chat.`,
            source: {
                name: FrameworkNotificationSources.CHAT
            },
            title: 'Chat',
            type: NotificationType.info
        };
        NotificationManager.getInstance().show(notification);
    }
    addChatMessage(message) {
        let chatMessageEl = document.createElement('div');
        browserUtil.addClasses(chatMessageEl, "message");
        // are we dealing with an "join"/"exit" message?
        if (message.from.trim().length === 0) {
            let messageSenderEl = document.createElement('div');
            browserUtil.addClasses(messageSenderEl, 'message-sender');
            messageSenderEl.innerText = message.message;
            chatMessageEl.appendChild(messageSenderEl);
        }
        else {
            if (message.from === ChatManager.getInstance().getCurrentUser()) {
                browserUtil.addClasses(chatMessageEl, "my-message");
            }
            else {
                let messageSenderEl = document.createElement('div');
                browserUtil.addClasses(messageSenderEl, 'message-sender');
                messageSenderEl.innerText = message.from + '   ' + moment(message.created, 'YYYYMMDDHHmmss').format('DD/MM/YYYY ');
                chatMessageEl.appendChild(messageSenderEl);
            }
            let contentEl = document.createElement('div');
            if (message.from === ChatManager.getInstance().getCurrentUser()) {
                browserUtil.addClasses(contentEl, "my-message-content");
            }
            else {
                browserUtil.addClasses(contentEl, 'message-content');
            }
            contentEl.innerText = message.message;
            chatMessageEl.appendChild(contentEl);
        }
        this.chatLogDiv.appendChild(chatMessageEl);
        return chatMessageEl;
    }
    reRenderChatMessages(chatLog) {
        browserUtil.removeAllChildren(this.chatLogDiv);
        let messageEl = null;
        chatLog.messages.forEach((message) => {
            messageEl = this.addChatMessage(message);
        });
        // scroll to the last message (if any)
        if (messageEl)
            browserUtil.scrollTo(messageEl);
    }
    renderChatLog(chatLog) {
        csLoggerDetail(`Chat Log ${chatLog.roomName} rendering`);
        if (this.selectedChatLog) {
            if (this.selectedChatLog.roomName === chatLog.roomName) {
                this.selectedChatLog = chatLog;
                ChatManager.getInstance().touchChatLog(chatLog.roomName);
                // render the chat conversation
                this.reRenderChatMessages(chatLog);
            }
        }
    }
    handleChatLogsUpdated() {
        if (this.selectedChatLog) {
            ChatManager.getInstance().touchChatLog(this.selectedChatLog.roomName);
            // render the chat conversation
            this.reRenderChatMessages(this.selectedChatLog);
        }
        this.checkCanComment();
    }
    handleChatStarted(log) {
        this.selectedChatLog = log;
        this.renderChatLog(log);
    }
    stateChanged(managerName, name, newValue) {
        if (name === STATE_NAMES.users) {
            // @ts-ignore
            const fastSearchEl = $(`#${ChatLogDetailView.ssFastSearchUserNames}`);
            // what is my username?
            let myUsername = SecurityManager.getInstance().getLoggedInUsername();
            // for each name, construct the patient details to display and the id referenced
            const fastSearchValues = [];
            newValue.forEach((item) => {
                const searchValue = {
                    label: item.username,
                    value: item._id,
                };
                // @ts-ignore
                if (myUsername !== item.username)
                    fastSearchValues.push(searchValue); // don't search for ourselves
            });
            fastSearchEl.autocomplete({ source: fastSearchValues });
            fastSearchEl.autocomplete('option', { disabled: false, minLength: 1 });
        }
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
        this.stateChanged(managerName, name, this.stateManager.getStateByName(name));
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
    }
    handleOfflineMessagesReceived(messages) {
    }
    handleInvitationDeclined(room, username) {
    }
    handleNewInviteReceived(invite) {
        return true;
    }
    itemDragStarted(view, selectedItem) {
    }
    itemAction(view, actionName, selectedItem) {
    }
    documentLoaded(view) {
    }
    showRequested(view) {
    }
    itemDropped(view, droppedItem) {
    }
    getName() {
        return VIEW_NAME.chatLog;
    }
    hide() {
        this.hideRequested(this);
    }
    getDataSourceKeyId() {
        return "";
    }
    getUIConfig() {
        // @ts-ignore
        return undefined;
    }
    render() {
    }
    show() {
    }
    getItemDescription(from, item) {
        return "";
    }
    getItemId(from, item) {
        return "";
    }
    filterResults(managerName, name, filterResults) {
    }
    foundResult(managerName, name, foundItem) {
    }
    leaveChat(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.selectedChatLog) {
            ChatManager.getInstance().leaveChat(this.selectedChatLog.roomName);
            this.selectedChatLog = null;
            this.clearChatLog();
            this.checkCanComment();
        }
    }
    checkCanComment() {
        if (this.selectedChatLog) {
            if (this.commentEl)
                this.commentEl.removeAttribute("readonly");
            if (this.commentEl)
                this.commentEl.removeAttribute("disabled");
            if (this.sendMessageButton)
                this.sendMessageButton.removeAttribute("disabled");
            if (this.leaveChatButton)
                this.leaveChatButton.removeAttribute("disabled");
            if (this.fastUserSearch)
                this.fastUserSearch.removeAttribute("disabled");
        }
        else {
            if (this.commentEl)
                this.commentEl.setAttribute("readonly", "true");
            if (this.commentEl)
                this.commentEl.setAttribute("disabled", "true");
            if (this.sendMessageButton)
                this.sendMessageButton.setAttribute("disabled", "true");
            if (this.leaveChatButton)
                this.leaveChatButton.setAttribute("disabled", "true");
            if (this.fastUserSearch)
                this.fastUserSearch.setAttribute("disabled", "true");
        }
    }
    clearChatLog() {
        browserUtil.removeAllChildren(this.chatLogDiv);
    }
}
ChatLogDetailView.newFormId = "newMessage";
ChatLogDetailView.commentId = "message";
ChatLogDetailView.submitCommentId = "submitMessage";
ChatLogDetailView.chatLogId = 'chatLog';
ChatLogDetailView.chatLogRoomId = 'chatLogRoom';
ChatLogDetailView.leaveChatId = 'leaveChat';
ChatLogDetailView.chatFastSearchUserNames = 'chatFastSearchUserNames';
//# sourceMappingURL=ChatLogDetailView.js.map