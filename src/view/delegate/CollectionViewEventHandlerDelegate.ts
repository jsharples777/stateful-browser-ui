import {AbstractView} from "../implementation/AbstractView";
import {CollectionViewListenerForwarder} from "./CollectionViewListenerForwarder";
import {AlertManager} from "../../alert/AlertManager";
import debug from "debug";
import {CollectionView} from "../interface/CollectionView";
import {AlertEvent, AlertType} from "../../alert/AlertListener";
import {CollectionViewEventDelegate} from "../interface/CollectionViewEventDelegate";
import {KeyType} from "browser-state-management";
import {ActionType, EXTRA_ACTION_ATTRIBUTE_NAME} from "../../ConfigurationTypes";
import {ExtraAction} from "../../CommonTypes";


const logger = debug('collection-view-event-handler-delegate');

export type ItemContext = {
    itemId: string,
    dataSource: string;
}


export class CollectionViewEventHandlerDelegate implements CollectionViewEventDelegate {
    protected view: CollectionView;
    protected selectedItem: any | null = null;
    protected eventForwarder: CollectionViewListenerForwarder;

    constructor(view: CollectionView, forwarder: CollectionViewListenerForwarder) {
        this.view = view;
        this.eventForwarder = forwarder;

        // event handlers
        this.eventStartDrag = this.eventStartDrag.bind(this);
        this.eventActionClicked = this.eventActionClicked.bind(this);
        this.eventClickItem = this.eventClickItem.bind(this);
        this.eventDeleteClickItem = this.eventDeleteClickItem.bind(this);


    }

    getDragData(event: DragEvent): any {
        const context = this.getItemContext(event);
        let itemId = context.itemId;
        const dataSource = context.dataSource;

        if (this.view.getCollectionUIConfig().keyType === KeyType.number) { // @ts-ignore
            itemId = parseInt(itemId);
        }
        logger(`view ${this.view.getName()}: Item with id ${itemId} getting drag data from ${dataSource}`);

        let compareWith = {};
        // @ts-ignore
        compareWith[this.view.getCollectionUIConfig().keyId] = itemId;

        let selectedItem = {};

        selectedItem = this.view.getItemInNamedCollection(this.view.getCollectionName(), compareWith);

        if (selectedItem) {
            // @ts-ignore
            selectedItem[DRAGGABLE_TYPE] = this.view.getCollectionUIConfig().detail.drag?.type;
            // @ts-ignore
            selectedItem[DRAGGABLE_FROM] = this.view.getCollectionUIConfig().detail.drag?.from;
        }
        return selectedItem;
    }

    eventStartDrag(event: DragEvent): void {
        logger(`view ${this.view.getName()}: drag start`);
        logger(event.target);
        const data = JSON.stringify(this.getDragData(event));
        logger(data);
        // @ts-ignore
        event.dataTransfer.setData(DRAGGABLE_KEY_ID, data);
        (<CollectionViewListenerForwarder>(this.eventForwarder)).itemDragStarted(this.view, data);
    }

    eventClickItem(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const context = this.getItemContext(event);
        let itemId = context.itemId;
        const dataSource = context.dataSource;

        if (this.view.getCollectionUIConfig().keyType === KeyType.number) { // @ts-ignore
            itemId = parseInt(itemId);
        }
        logger(`view ${this.view.getName()}: Item with id ${itemId} clicked from ${dataSource}`);
        let compareWith = {};
        // @ts-ignore
        compareWith[this.view.getCollectionUIConfig().keyId] = itemId;
        logger(compareWith);

        let selectedItem = this.view.getItemInNamedCollection(this.view.getCollectionName(), compareWith);
        logger(selectedItem);
        if (selectedItem) {
            const shouldSelect = (<CollectionViewListenerForwarder>(this.eventForwarder)).canSelectItem(this.view, selectedItem);
            logger(`view ${this.view.getName()}: Item with id ${itemId} attempting selected from ${dataSource} - ${shouldSelect}`);
            if (shouldSelect) {
                this.selectedItem = selectedItem;
                logger(selectedItem);
                (<CollectionViewListenerForwarder>(this.eventForwarder)).itemSelected(this.view, selectedItem);
            }
        }
    }

    eventDeleteClickItem(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const context = this.getItemContext(event);
        let itemId = context.itemId;
        const dataSource = context.dataSource;

        if (this.view.getCollectionUIConfig().keyType === KeyType.number) { // @ts-ignore
            itemId = parseInt(itemId);
        }
        logger(`view ${this.view.getName()}: Item with id ${itemId} attempting delete from ${dataSource}`);
        let compareWith = {};
        // @ts-ignore
        compareWith[this.view.getCollectionUIConfig().keyId] = itemId;
        logger(compareWith);

        let selectedItem = this.view.getItemInNamedCollection(this.view.getCollectionName(), compareWith);
        if (selectedItem) {
            const shouldDelete = this.eventForwarder.canDeleteItem(this.view, selectedItem);
            logger(`view ${this.view.getName()}: Item with id ${itemId} attempting delete from ${dataSource} - ${shouldDelete}`);
            if (shouldDelete) {
                // do we need to confirm?
                if (this.view.getCollectionUIConfig().detail.quickDelete) {
                    this.selectedItem = null;
                    this.eventForwarder.itemDeleted(this.view, selectedItem, event.target);
                } else {
                    AlertManager.getInstance().startAlert(this, this.view.getName(), `Are you sure you want to delete this information?`, {
                        actionType: ActionType.DELETE,
                        item: selectedItem,
                        target: event.target
                    });
                }

            }
        }
    }

    eventActionClicked(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const context = this.getItemContext(event);
        let itemId = context.itemId;
        const dataSource = context.dataSource;

        if (event.target) {
            const actionName = (<HTMLElement>event.target).getAttribute(EXTRA_ACTION_ATTRIBUTE_NAME);

            // get the action def
            const uiConfig = this.view.getCollectionUIConfig();
            let actionConfig: ExtraAction | null = null;
            if (uiConfig.extraActions) {
                const foundIndex = uiConfig.extraActions.findIndex((extraAction) => extraAction.name === actionName);
                if (foundIndex >= 0) actionConfig = uiConfig.extraActions[foundIndex];
            }

            const shouldConfirm = ((actionConfig) && (actionConfig.confirm));


            if (this.view.getCollectionUIConfig().keyType === KeyType.number) { // @ts-ignore
                itemId = parseInt(itemId);
            }
            logger(`view ${this.view.getName()}: Item with id ${itemId} attempting action ${actionName} from ${dataSource}`);
            let compareWith = {};
            // @ts-ignore
            compareWith[this.view.getCollectionUIConfig().keyId] = itemId;
            logger(compareWith);

            let selectedItem = this.view.getItemInNamedCollection(this.view.getCollectionName(), compareWith);
            if (selectedItem) {
                const shouldSelect = (<CollectionViewListenerForwarder>(this.eventForwarder)).canSelectItem(this.view, selectedItem);
                logger(`view ${this.view.getName()}: Item with id ${itemId} attempting action ${actionName} from ${dataSource} - ${shouldSelect}`);
                if (shouldSelect) {
                    // do we need to confirm action?
                    if (shouldConfirm) {
                        AlertManager.getInstance().startAlert(this, this.view.getName(), `${actionName}: please confirm this action`, {
                            actionType: ActionType.EXTRA_ACTION,
                            actionName: actionName,
                            item: selectedItem,
                            target: event.target
                        });
                    } else {
                        this.selectedItem = selectedItem;
                        logger(selectedItem);
                        if (actionName) {
                            this.eventForwarder.itemAction(this.view, actionName, selectedItem, event.target);
                        }
                    }
                }
            }

        }

    }

    alertCompleted(event: AlertEvent): void {
        logger(event.context);
        if (event.outcome === AlertType.confirmed) {
            if (event.context.actionType === ActionType.DELETE) {
                this.selectedItem = null;
                this.eventForwarder.itemDeleted(this.view, event.context.item, event.context.target);
            }
            if (event.context.actionType === ActionType.EXTRA_ACTION) {
                this.selectedItem = event.context.item;
                this.eventForwarder.itemAction(this.view, event.context.actionName, event.context.item, event.context.target);
            }
        }
    }

    protected getItemContext(event: Event): ItemContext {
        // @ts-ignore
        const itemId = event.target.getAttribute(this.view.getCollectionUIConfig().keyId);
        // @ts-ignore
        const dataSource = event.target.getAttribute(AbstractView.DATA_SOURCE);

        let context: ItemContext = {
            itemId: itemId,
            dataSource: dataSource
        }

        return context;
    }

}
