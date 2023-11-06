import debug from 'debug';

import moment from "moment";
import {CollectionViewListener} from "../view/interface/CollectionViewListener";
import {View} from '../view/interface/View';
import {CollectionView} from '../view/interface/CollectionView';
import {DRAGGABLE, STATE_NAMES, VIEW_NAME} from "./ChatTypes";
import {v4} from "uuid";
import {
    FrameworkNotificationSources, NotificationContent,
    NotificationType
} from "browser-state-management";
import {
    ChatEventListener,
    ChatLog, ChatManager,
    Invitation,
    Message, NotificationController,
    NotificationManager,
    Priority,
    SecurityManager, SimpleAttachment,
    StateChangeListener, StateManager
} from "browser-state-management";
import {browserUtil,NotificationLocation} from "browser-state-management";
import {Modifier, ViewDOMConfig} from "../ConfigurationTypes";
import {DRAGGABLE_KEY_ID, DRAGGABLE_TYPE} from "../CommonTypes";


const csLoggerDetail = debug('chat-sidebar:detail');

export class ChatLogDetailView implements View, ChatEventListener, CollectionViewListener, StateChangeListener {
    private static _instance: ChatLogDetailView;
    private static newFormId: string = "newMessage";
    private static commentId: string = "message";
    private static submitCommentId: string = "submitMessage";
    private static chatLogId: string = 'chatLog';
    private static chatLogRoomId: string = 'chatLogRoom';
    private static leaveChatId: string = 'leaveChat';
    private static chatFastSearchUserNames: string = 'chatFastSearchUserNames';
    // @ts-ignore
    protected chatRoomDiv: HTMLElement;
    // @ts-ignore
    protected chatLogDiv: HTMLElement;
    // @ts-ignore
    protected chatForm: HTMLElement;
    // @ts-ignore
    protected commentEl: HTMLElement;
    // @ts-ignore
    protected sendMessageButton: HTMLElement;
    // @ts-ignore
    protected leaveChatButton: HTMLElement;
    // @ts-ignore
    protected fastUserSearch: HTMLElement;
    protected stateManager: StateManager;
    protected selectedChatLog: ChatLog | null;

    private constructor(stateManager: StateManager) {
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

    public static getInstance(stateManager: StateManager): ChatLogDetailView {
        if (!(ChatLogDetailView._instance)) {
            ChatLogDetailView._instance = new ChatLogDetailView(stateManager);
        }
        return ChatLogDetailView._instance;
    }

    clearDisplay(): void {

    }

    isShowing(): boolean {
        return true;
    }

    collectionChanged(view: CollectionView): void {

    }

    hasActionPermission(actionName: string, from: string, item: any): boolean {
        return true;
    }

    getListenerName(): string {
        return 'Chat Log Details';
    }

    canSelectItem(view: CollectionView, selectedItem: any): boolean {
        return true;
    }

    hasPermissionToDeleteItemInNamedCollection(name: string, item: any): boolean {
        return true;
    }

    hasPermissionToUpdateItemInNamedCollection(name: string, item: any): boolean {
        return true;
    }

    hasChanged(): boolean {
        return false;
    }

    setContainedBy(container: HTMLElement): void {
    }

    addEventListener(listener: CollectionViewListener): void {
    }

    getIdForItemInNamedCollection(name: string, item: any): string {
        throw new Error('Method not implemented.');
    }

    getDisplayValueForItemInNamedCollection(name: string, item: any): string {
        throw new Error('Method not implemented.');
    }

    compareItemsForEquality(item1: any, item2: any): boolean {
        throw new Error('Method not implemented.');
    }

    getModifierForItemInNamedCollection(name: string, item: any): Modifier {
        throw new Error('Method not implemented.');
    }

    getSecondaryModifierForItemInNamedCollection(name: string, item: any): Modifier {
        throw new Error('Method not implemented.');
    }

    getBadgeValueForItemInNamedCollection(name: string, item: any): number {
        throw new Error('Method not implemented.');
    }

    getBackgroundImageForItemInNamedCollection(name: string, item: any): string {
        throw new Error('Method not implemented.');
    }

    updateViewForNamedCollection(name: string, newState: any): void {
        throw new Error('Method not implemented.');
    }

    itemDeselected(view: View, selectedItem: any): void {
        csLoggerDetail(`Chat Log with id ${selectedItem.roomName} deselected`);
        if (this.selectedChatLog && (selectedItem.roomName === this.selectedChatLog.roomName)) {
            this.selectedChatLog = null;
            this.checkCanComment();
            this.clearChatLog();
        }
    }


    itemSelected(view: View, selectedItem: ChatLog): void {
        this.selectedChatLog = selectedItem;
        if (this.selectedChatLog) {
            csLoggerDetail(`Chat Log with id ${selectedItem.roomName} selected`);
            this.checkCanComment();
            this.renderChatLog(this.selectedChatLog);
        }
    }

    canDeleteItem(view: View, selectedItem: any): boolean {
        return true;
    }

    itemDeleted(view: View, selectedItem: any): void {
        csLoggerDetail(`Chat Log with ${selectedItem.roomName} deleting`);
        if (this.selectedChatLog && (this.selectedChatLog.roomName === selectedItem.roomName)) {
            this.checkCanComment();
            this.renderChatLog(this.selectedChatLog);
        }
    }

    hideRequested(view: View): void {
        this.selectedChatLog = null;
        this.checkCanComment();
        this.clearChatLog();
    }

    handleUserDrop(event: Event) {
        csLoggerDetail('drop event on current chat room');
        if (this.selectedChatLog) {
            // @ts-ignore
            const draggedObjectJSON = event.dataTransfer.getData(DRAGGABLE_KEY_ID);
            const draggedObject = JSON.parse(draggedObjectJSON);
            csLoggerDetail(draggedObject);

            if (draggedObject[DRAGGABLE_TYPE] === DRAGGABLE.typeUser) {
                //add the user to the current chat if not already there
                ChatManager.getInstance().sendInvite(draggedObject.username, this.selectedChatLog.roomName);

                const notification:NotificationContent = {
                    duration: 5000,
                    id: v4(),
                    message: `Invited ${draggedObject.username} to the chat.`,
                    source: {
                        name: FrameworkNotificationSources.CHAT,
                        id: this.selectedChatLog.roomName
                    },
                    title: 'Chat',
                    type: NotificationType.info,
                    location: NotificationLocation.topright,


                }
                NotificationManager.getInstance().show(notification);
            }
        }

    }

    handleChatLogUpdated(log: ChatLog): void {
        csLoggerDetail(`Handling chat log updates`);
        this.checkCanComment();
        this.renderChatLog(log);
    }

    handleAddMessage(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        csLoggerDetail(`Handling message event`);
        if (this.selectedChatLog) {
            // @ts-ignore
            if (this.commentEl && this.commentEl.value.trim().length === 0) return;
            // @ts-ignore
            const messageContent = this.commentEl.value.trim();
            // @ts-ignore
            this.commentEl.value = '';

            const simpleAttachment: SimpleAttachment = {identifier: '', type: '', displayText: ''};
            let sentMessage: Message | null = ChatManager.getInstance().sendMessage(this.selectedChatLog.roomName, messageContent, Priority.Normal, simpleAttachment, {});
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
            if (this.selectedChatLog) event.preventDefault();
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

    eventUserSelected(event: Event, ui: any) {
        event.preventDefault();
        event.stopPropagation();
        csLoggerDetail(`User ${ui.item.label} with id ${ui.item.value} selected`);
        // @ts-ignore
        event.target.innerText = '';

        // add to the chat, if one selected
        if (this.selectedChatLog) ChatManager.getInstance().sendInvite(ui.item.label, this.selectedChatLog.roomName);

        const notification:NotificationContent = {
            duration: 5000,
            id: v4(),
            message: `Invited ${ui.item.label} to the chat.`,
            source: {
                name: FrameworkNotificationSources.CHAT
            },
            title: 'Chat',
            type: NotificationType.info,
            location: NotificationLocation.topright

        }
        NotificationManager.getInstance().show(notification);
    }

    addChatMessage(message: Message): HTMLElement {
        let chatMessageEl = document.createElement('div');
        browserUtil.addClasses(chatMessageEl, "message");
        // are we dealing with an "join"/"exit" message?
        if (message.from.trim().length === 0) {
            let messageSenderEl = document.createElement('div');
            browserUtil.addClasses(messageSenderEl, 'message-sender');
            messageSenderEl.innerText = message.message;
            chatMessageEl.appendChild(messageSenderEl);
        } else {

            if (message.from === ChatManager.getInstance().getCurrentUser()) {
                browserUtil.addClasses(chatMessageEl, "my-message");
            } else {
                let messageSenderEl = document.createElement('div');
                browserUtil.addClasses(messageSenderEl, 'message-sender');
                messageSenderEl.innerText = message.from + '   ' + moment(message.created, 'YYYYMMDDHHmmss').format('DD/MM/YYYY ');
                chatMessageEl.appendChild(messageSenderEl);
            }

            let contentEl = document.createElement('div');
            if (message.from === ChatManager.getInstance().getCurrentUser()) {
                browserUtil.addClasses(contentEl, "my-message-content");
            } else {
                browserUtil.addClasses(contentEl, 'message-content');
            }
            contentEl.innerText = message.message;
            chatMessageEl.appendChild(contentEl);
        }

        this.chatLogDiv.appendChild(chatMessageEl);
        return chatMessageEl;
    }

    reRenderChatMessages(chatLog: ChatLog) {
        browserUtil.removeAllChildren(this.chatLogDiv);
        let messageEl: HTMLElement | null = null;
        chatLog.messages.forEach((message: Message) => {
            messageEl = this.addChatMessage(message);
        });
        // scroll to the last message (if any)
        if (messageEl) browserUtil.scrollTo(messageEl);
    }

    renderChatLog(chatLog: ChatLog) {
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


    handleChatLogsUpdated(): void {
        if (this.selectedChatLog) {
            ChatManager.getInstance().touchChatLog(this.selectedChatLog.roomName);
            // render the chat conversation
            this.reRenderChatMessages(this.selectedChatLog);
        }
        this.checkCanComment();
    }

    handleChatStarted(log: ChatLog): void {
        this.selectedChatLog = log;
        this.renderChatLog(log);
    }

    stateChanged(managerName: string, name: string, newValue: any): void {
        if (name === STATE_NAMES.users) {
            // @ts-ignore
            const fastSearchEl = $(`#${ChatLogDetailView.ssFastSearchUserNames}`);
            // what is my username?
            let myUsername = SecurityManager.getInstance().getLoggedInUsername();
            // for each name, construct the patient details to display and the id referenced
            const fastSearchValues: any = [];
            newValue.forEach((item: any) => {
                const searchValue = {
                    label: item.username,
                    value: item._id,
                };
                // @ts-ignore
                if (myUsername !== item.username) fastSearchValues.push(searchValue); // don't search for ourselves
            });
            fastSearchEl.autocomplete({source: fastSearchValues});
            fastSearchEl.autocomplete('option', {disabled: false, minLength: 1});
        }
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
        this.stateChanged(managerName, name, this.stateManager.getStateByName(name));
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
    }

    handleOfflineMessagesReceived(messages: Message[]): void {
    }

    handleInvitationDeclined(room: string, username: string): void {
    }

    handleNewInviteReceived(invite: Invitation): boolean {
        return true;
    }

    itemDragStarted(view: View, selectedItem: any): void {
    }

    itemAction(view: View, actionName: string, selectedItem: any): void {
    }

    documentLoaded(view: View): void {
    }

    showRequested(view: View): void {
    }

    itemDropped(view: View, droppedItem: any): void {
    }

    getName(): string {
        return VIEW_NAME.chatLog;
    }

    hide(): void {
        this.hideRequested(this);
    }

    getDataSourceKeyId(): string {
        return "";
    }

    getUIConfig(): ViewDOMConfig {
        // @ts-ignore
        return undefined;
    }

    render(): void {
    }

    show(): void {
    }

    getItemDescription(from: string, item: any): string {
        return "";
    }

    getItemId(from: string, item: any): string {
        return "";
    }

    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    foundResult(managerName: string, name: string, foundItem: any): void {
    }

    private leaveChat(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.selectedChatLog) {
            ChatManager.getInstance().leaveChat(this.selectedChatLog.roomName);
            this.selectedChatLog = null;
            this.clearChatLog();
            this.checkCanComment();
        }
    }

    private checkCanComment() {
        if (this.selectedChatLog) {
            if (this.commentEl) this.commentEl.removeAttribute("readonly");
            if (this.commentEl) this.commentEl.removeAttribute("disabled");
            if (this.sendMessageButton) this.sendMessageButton.removeAttribute("disabled");
            if (this.leaveChatButton) this.leaveChatButton.removeAttribute("disabled");
            if (this.fastUserSearch) this.fastUserSearch.removeAttribute("disabled");
        } else {
            if (this.commentEl) this.commentEl.setAttribute("readonly", "true");
            if (this.commentEl) this.commentEl.setAttribute("disabled", "true");
            if (this.sendMessageButton) this.sendMessageButton.setAttribute("disabled", "true");
            if (this.leaveChatButton) this.leaveChatButton.setAttribute("disabled", "true");
            if (this.fastUserSearch) this.fastUserSearch.setAttribute("disabled", "true");
        }

    }

    private clearChatLog() {
        browserUtil.removeAllChildren(this.chatLogDiv);
    }

    itemNotModified(managerName: string, name: string, item: any) {
    }

}


