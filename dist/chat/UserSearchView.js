import debug from 'debug';
import { AbstractStatefulCollectionView } from "../view/implementation/AbstractStatefulCollectionView";
import { ListViewRenderer } from "../view/renderer/ListViewRenderer";
import { DRAGGABLE, STATE_NAMES, VIEW_NAME } from "./ChatTypes";
import { ChatRoomsSidebar } from "./ChatRoomsSidebar";
import { ChatLogsView } from "./ChatLogsView";
import { BrowserStorageStateManager, ChatManager, isSameMongo, KeyType, NotificationController, SecurityManager } from "browser-state-management";
import { Modifier } from "../ConfigurationTypes";
const vLogger = debug('user-search');
const vLoggerDetail = debug('user-search-detail');
export class UserSearchView extends AbstractStatefulCollectionView {
    constructor(stateManager) {
        super(UserSearchView.DOMConfig, stateManager, STATE_NAMES.users);
        this.loggedInUsers = [];
        this.renderer = new ListViewRenderer(this, this);
        // handler binding
        this.updateViewForNamedCollection = this.updateViewForNamedCollection.bind(this);
        this.eventUserSelected = this.eventUserSelected.bind(this);
        this.handleLoggedInUsersUpdated = this.handleLoggedInUsersUpdated.bind(this);
        this.handleFavouriteUserLoggedIn = this.handleFavouriteUserLoggedIn.bind(this);
        this.handleFavouriteUserLoggedOut = this.handleFavouriteUserLoggedOut.bind(this);
        this.handleFavouriteUsersChanged = this.handleFavouriteUsersChanged.bind(this);
        this.handleBlockedUsersChanged = this.handleBlockedUsersChanged.bind(this);
        this.handleLoggedInUsersUpdated = this.handleLoggedInUsersUpdated.bind(this);
        this.itemDeleted = this.itemDeleted.bind(this);
        // register state change listening
        this.localisedSM = new BrowserStorageStateManager(true, false, isSameMongo);
        this.localisedSM.addChangeListenerForName(STATE_NAMES.recentUserSearches, this);
        NotificationController.getInstance().addUserListener(this);
        vLogger(this.localisedSM.getStateByName(STATE_NAMES.recentUserSearches));
    }
    static getInstance(stateManager) {
        if (!(UserSearchView._instance)) {
            UserSearchView._instance = new UserSearchView(stateManager);
        }
        return UserSearchView._instance;
    }
    handleLoggedInUsersUpdated(usernames) {
        vLogger(`Received new list of users who are logged in `);
        vLogger(usernames);
        this.loggedInUsers = usernames;
        this.updateViewForNamedCollection(STATE_NAMES.recentUserSearches, {});
    }
    handleFavouriteUserLoggedIn(username) {
        vLogger(`Handle Favourite User ${username} logged in`);
        this.updateViewForNamedCollection(STATE_NAMES.recentUserSearches, {});
    }
    handleFavouriteUserLoggedOut(username) {
        vLogger(`Handle Favourite User ${username} logged in`);
        this.updateViewForNamedCollection(STATE_NAMES.recentUserSearches, {});
    }
    handleFavouriteUsersChanged(usernames) {
        vLogger(`Handle Favourite Users changed to ${usernames}`);
        this.updateViewForNamedCollection(STATE_NAMES.recentUserSearches, {});
    }
    handleBlockedUsersChanged(usernames) {
        vLogger(`Handle Blocked Users changed to ${usernames}`);
        this.updateViewForNamedCollection(STATE_NAMES.recentUserSearches, {});
    }
    onDocumentLoaded() {
        super.onDocumentLoaded();
        const fastSearchEl = $(`#${UserSearchView.fastSearchInputId}`);
        // @ts-ignore
        fastSearchEl.on('autocompleteselect', this.eventUserSelected);
    }
    getIdForItemInNamedCollection(name, item) {
        return item._id;
    }
    renderDisplayForItemInNamedCollection(containerEl, name, item) {
        containerEl.innerHTML = item.username;
    }
    getModifierForItemInNamedCollection(name, item) {
        let result = Modifier.normal;
        vLoggerDetail(`Checking for item modifiers`);
        vLoggerDetail(item);
        // if the user is currently logged out make the item inactive
        if (!ChatManager.getInstance().isUserLoggedIn(item.username)) {
            result = Modifier.inactive;
        }
        return result;
    }
    getSecondaryModifierForItemInNamedCollection(name, item) {
        let result = Modifier.normal;
        vLoggerDetail(`Checking for item secondary modifiers ${item.username}`);
        // if the user is in the black list then show warning and a favourite user is highlighted
        if (NotificationController.getInstance().isFavouriteUser(item.username)) {
            vLoggerDetail(`is favourite`);
            result = Modifier.active;
        }
        if (NotificationController.getInstance().isBlockedUser(item.username)) {
            vLoggerDetail(`is blocked`);
            result = Modifier.warning;
        }
        return result;
    }
    eventUserSelected(event, ui) {
        event.preventDefault();
        event.stopPropagation();
        vLogger(`User ${ui.item.label} with id ${ui.item.value} selected`);
        // @ts-ignore
        event.target.innerText = '';
        // add the selected user to the recent user searches
        if (this.localisedSM.isItemInState(STATE_NAMES.recentUserSearches, { _id: ui.item.value }))
            return;
        const recentUserSearches = this.localisedSM.getStateByName(STATE_NAMES.recentUserSearches);
        vLogger(`saved searches too long? ${STATE_NAMES.recentUserSearches}`);
        if (recentUserSearches.length >= UserSearchView.dataLimit) {
            vLogger('saved searches too long - removing first');
            // remove the first item from recent searches
            const item = recentUserSearches.shift();
            this.localisedSM.removeItemFromState(STATE_NAMES.recentUserSearches, item, true);
        }
        // save the searches
        this.localisedSM.addNewItemToState(STATE_NAMES.recentUserSearches, {
            _id: ui.item.value,
            username: ui.item.label
        }, true);
    }
    updateViewForNamedCollection(name, newState) {
        if (name === STATE_NAMES.recentUserSearches) {
            vLogger(`Updating for recent searches`);
            newState = this.localisedSM.getStateByName(STATE_NAMES.recentUserSearches);
            vLogger(newState);
            super.updateViewForNamedCollection(name, newState);
        }
        if (name === STATE_NAMES.users) {
            // load the search names into the search field
            // what is my username?
            let myUsername = SecurityManager.getInstance().getLoggedInUsername();
            // @ts-ignore
            const fastSearchEl = $(`#${UserSearchView.fastSearchInputId}`);
            // for each name, construct the patient details to display and the id referenced
            const fastSearchValues = [];
            newState.forEach((item) => {
                const searchValue = {
                    label: item.username,
                    value: item._id,
                };
                if (myUsername !== item.username)
                    fastSearchValues.push(searchValue); // don't search for ourselves
            });
            fastSearchEl.autocomplete({ source: fastSearchValues });
            fastSearchEl.autocomplete('option', { disabled: false, minLength: 1 });
        }
    }
    itemAction(view, actionName, selectedItem) {
        // @ts-ignore
        if (actionName === this.collectionUIConfig.extraActions[0].name) {
            if (ChatManager.getInstance().isUserInFavouriteList(selectedItem.username)) {
                vLogger(`${selectedItem.username} already in fav list, ignoring`);
                return;
            }
            ChatManager.getInstance().addUserToFavouriteList(selectedItem.username);
        }
        // @ts-ignore
        if (actionName === this.collectionUIConfig.extraActions[1].name) {
            if (ChatManager.getInstance().isUserInBlockedList(selectedItem.username)) {
                vLogger(`${selectedItem.username} already in blocked list, ignoring`);
                return;
            }
            ChatManager.getInstance().addUserToBlockedList(selectedItem.username);
        }
    }
    compareItemsForEquality(item1, item2) {
        return isSameMongo(item1, item2);
    }
    itemDeleted(view, selectedItem) {
        vLoggerDetail(selectedItem);
        vLogger(`Recent search user ${selectedItem.username} with id ${selectedItem.id} deleted - removing`);
        this.localisedSM.removeItemFromState(STATE_NAMES.recentUserSearches, selectedItem, true);
    }
    itemSelected(view, selectedItem) {
        const roomName = NotificationController.getInstance().startChatWithUser(selectedItem.username);
        ChatRoomsSidebar.getInstance(this.stateManager).show();
        if (roomName)
            ChatLogsView.getInstance().selectChatRoom(roomName);
    }
}
UserSearchView.fastSearchInputId = 'fastSearchUserNames';
UserSearchView.dataLimit = 10;
UserSearchView.DOMConfig = {
    viewConfig: {
        resultsContainerId: 'recentUserSearches',
        dataSourceId: VIEW_NAME.userSearch,
    },
    resultsElement: {
        type: 'a',
        attributes: [{ name: 'href', value: '#' }],
        classes: 'list-group-item my-list-item truncate-notification list-group-item-action'
    },
    keyId: '_id',
    keyType: KeyType.string,
    modifiers: {
        normal: 'list-group-item-primary',
        inactive: 'list-group-item-light',
        active: 'list-group-item-info',
        warning: 'list-group-item-danger'
    },
    icons: {
        normal: 'fas fa-comment',
        inactive: 'fas fa-comment',
        active: 'fas fa-heart',
        warning: 'fas fa-exclamation-circle'
    },
    detail: {
        containerClasses: 'd-flex w-100 justify-content-between',
        textElement: {
            type: 'span',
            classes: 'mb-1'
        },
        select: true,
        quickDelete: true,
        delete: {
            classes: 'btn bg-danger text-white btn-circle btn-sm',
            iconClasses: 'fas fa-trash-alt',
        },
        drag: {
            type: DRAGGABLE.typeUser,
            from: DRAGGABLE.fromUserSearch
        },
    },
    extraActions: [
        {
            name: 'favourite',
            button: {
                classes: 'btn bg-info text-white btn-circle btn-sm mr-1',
                iconClasses: 'fas fa-user-plus'
            },
            confirm: false
        },
        {
            name: 'block',
            button: {
                classes: 'btn bg-warning text-white btn-circle btn-sm mr-1',
                iconClasses: 'fas fa-user-slash'
            },
            confirm: false
        }
    ]
};
//# sourceMappingURL=UserSearchView.js.map