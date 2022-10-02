import debug from 'debug';
import { AbstractStatefulCollectionView } from "../view/implementation/AbstractStatefulCollectionView";
import { ListViewRenderer } from "../view/renderer/ListViewRenderer";
import { DRAGGABLE, STATE_NAMES, VIEW_NAME } from "./ChatTypes";
import { ChatManager, KeyType, NotificationController } from "browser-state-management";
import { Modifier } from "../ConfigurationTypes";
const vLogger = debug('user-search-sidebar');
export class BlockedUserView extends AbstractStatefulCollectionView {
    constructor(stateManager) {
        super(BlockedUserView.DOMConfig, stateManager, STATE_NAMES.users);
        // list renderer
        this.renderer = new ListViewRenderer(this, this);
        // handler binding
        this.handleLoggedInUsersUpdated = this.handleLoggedInUsersUpdated.bind(this);
        this.handleFavouriteUserLoggedIn = this.handleFavouriteUserLoggedIn.bind(this);
        this.handleFavouriteUserLoggedOut = this.handleFavouriteUserLoggedOut.bind(this);
        this.handleFavouriteUsersChanged = this.handleFavouriteUsersChanged.bind(this);
        this.handleBlockedUsersChanged = this.handleBlockedUsersChanged.bind(this);
        this.handleLoggedInUsersUpdated = this.handleLoggedInUsersUpdated.bind(this);
        NotificationController.getInstance().addUserListener(this);
    }
    static getInstance(stateManager) {
        if (!(BlockedUserView._instance)) {
            BlockedUserView._instance = new BlockedUserView(stateManager);
        }
        return BlockedUserView._instance;
    }
    onDocumentLoaded() {
        super.onDocumentLoaded();
        this.addEventListener(this);
    }
    canDeleteItem(view, selectedItem) {
        return true;
    }
    documentLoaded(view) {
    }
    itemDeleted(view, selectedItem) {
        vLogger(`Blocked user ${selectedItem.username} with id ${selectedItem.id} deleted - removing`);
        ChatManager.getInstance().removeUserFromBlockedList(selectedItem.username);
    }
    itemSelected(view, selectedItem) {
        throw new Error('Method not implemented.');
    }
    itemDragStarted(view, selectedItem) {
        throw new Error('Method not implemented.');
    }
    itemAction(view, actionName, selectedItem) {
        throw new Error('Method not implemented.');
    }
    hideRequested(view) {
        throw new Error('Method not implemented.');
    }
    showRequested(view) {
        throw new Error('Method not implemented.');
    }
    handleLoggedInUsersUpdated(usernames) {
    }
    handleFavouriteUserLoggedIn(username) {
    }
    handleFavouriteUserLoggedOut(username) {
    }
    handleFavouriteUsersChanged(usernames) {
    }
    handleBlockedUsersChanged(usernames) {
        vLogger(`Handle Blocked Users changed to ${usernames}`);
        this.updateViewForNamedCollection('', {});
    }
    renderDisplayForItemInNamedCollection(containerEl, name, item) {
        containerEl.innerHTML = item.username;
    }
    getSecondaryModifierForItemInNamedCollection(name, item) {
        return Modifier.warning;
    }
    getIdForItemInNamedCollection(name, item) {
        return item._id;
    }
    updateViewForNamedCollection(name, newState) {
        var _a;
        // find the blocked users in the user list
        let blockedUsers = [];
        const users = (_a = this.stateManager) === null || _a === void 0 ? void 0 : _a.getStateByName(STATE_NAMES.users);
        if (users) {
            users.forEach((user) => {
                if (ChatManager.getInstance().isUserInBlockedList(user.username)) {
                    blockedUsers.push(user);
                }
            });
        }
        super.updateViewForNamedCollection(name, blockedUsers);
    }
    itemDropped(view, droppedItem) {
        if (ChatManager.getInstance().isUserInBlockedList(droppedItem.username)) {
            vLogger(`${droppedItem.username} already in blocked list, ignoring`);
            return;
        }
        // add the user to the Chat Manager and we should get an event about it
        ChatManager.getInstance().addUserToBlockedList(droppedItem.username);
    }
    itemDeselected(view, selectedItem) {
    }
    canSelectItem(view, selectedItem) {
        return false;
    }
}
BlockedUserView.DOMConfig = {
    viewConfig: {
        resultsContainerId: 'blockedUsers',
        dataSourceId: VIEW_NAME.blockedUsers,
        drop: {
            acceptFrom: [DRAGGABLE.fromUserSearch, DRAGGABLE.fromFavourites],
            acceptTypes: [DRAGGABLE.typeUser],
        }
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
    },
};
//# sourceMappingURL=BlockedUserView.js.map