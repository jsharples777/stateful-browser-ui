import { AbstractStatefulCollectionView } from "../view/implementation/AbstractStatefulCollectionView";
import { CollectionViewListener } from "../view/interface/CollectionViewListener";
import { View } from "../view/interface/View";
import { CollectionView } from "../view/interface/CollectionView";
import { ChatUserEventListener, StateManager } from "browser-state-management";
import { CollectionViewDOMConfig, Modifier } from "../ConfigurationTypes";
export declare class FavouriteUserView extends AbstractStatefulCollectionView implements ChatUserEventListener, CollectionViewListener {
    static DOMConfig: CollectionViewDOMConfig;
    private static _instance;
    private constructor();
    static getInstance(stateManager: StateManager): FavouriteUserView;
    onDocumentLoaded(): void;
    handleLoggedInUsersUpdated(usernames: string[]): void;
    handleFavouriteUserLoggedIn(username: string): void;
    handleFavouriteUserLoggedOut(username: string): void;
    handleFavouriteUsersChanged(usernames: string[]): void;
    getIdForItemInNamedCollection(name: string, item: any): any;
    renderDisplayForItemInNamedCollection(containerEl: HTMLElement, name: string, item: any): void;
    getModifierForItemInNamedCollection(name: string, item: any): Modifier.normal | Modifier.inactive;
    getSecondaryModifierForItemInNamedCollection(name: string, item: any): Modifier.normal | Modifier.active | Modifier.warning;
    updateViewForNamedCollection(name: string, newState: any): void;
    documentLoaded(view: View): void;
    handleBlockedUsersChanged(usernames: string[]): void;
    hideRequested(view: View): void;
    itemAction(view: View, actionName: string, selectedItem: any): void;
    canDeleteItem(view: View, selectedItem: any): boolean;
    itemDeleted(view: View, selectedItem: any): void;
    itemDragStarted(view: View, selectedItem: any): void;
    itemDeselected(view: View, selectedItem: any): void;
    itemDropped(view: View, droppedItem: any): void;
    itemSelected(view: View, selectedItem: any): void;
    showRequested(view: View): void;
    canSelectItem(view: CollectionView, selectedItem: any): boolean;
}
