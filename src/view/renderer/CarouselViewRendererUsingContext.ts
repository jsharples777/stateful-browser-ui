import debug from 'debug';
import {CollectionViewRenderer} from "../interface/CollectionViewRenderer";
import {CollectionView} from "../interface/CollectionView";
import {CollectionViewEventHandler} from "../interface/CollectionViewEventHandler";

import {ContextualInformationHelper, TogglePlacement} from "../../context/ContextualInformationHelper";
import {
    CarouselDOMConfig,
    EXTRA_ACTION_ATTRIBUTE_NAME, Modifier,
    RowPosition, SCREEN_WIDTH_LARGE, SCREEN_WIDTH_MEDIUM,
    SCREEN_WIDTH_SMALL
} from "../../ConfigurationTypes";
import {browserUtil} from "browser-state-management";

const logger = debug('carousel-renderer');

export class CarouselViewRendererUsingContext implements CollectionViewRenderer {
    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected config: CarouselDOMConfig;

    private lastRenderedContainer: HTMLElement | null = null;
    private lastRenderedCollectionName: string | null = null;
    private lastRenderedCollection: any | null = null;
    private previousWindowWidth: number = 0;

    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler, config: CarouselDOMConfig) {
        this.view = view;
        this.eventHandler = eventHandler;
        this.config = config;
    }

    onDocumentLoaded(): void {
        // we need to track window resizing
        this.previousWindowWidth = window.innerWidth;

        window.addEventListener('resize', (event) => {
            const newWindowWidth = window.innerWidth;
            let reRenderRequired: boolean = false;
            if (newWindowWidth < this.previousWindowWidth) {
                if (this.previousWindowWidth > SCREEN_WIDTH_LARGE) {
                    if (newWindowWidth <= SCREEN_WIDTH_LARGE) {
                        // need to re-render carousel
                        reRenderRequired = true;
                        logger(`window reduced and is now smaller or equal to large`);
                    }
                }
                if (this.previousWindowWidth > SCREEN_WIDTH_MEDIUM) {
                    if (newWindowWidth <= SCREEN_WIDTH_MEDIUM) {
                        // need to re-render carousel
                        reRenderRequired = true;
                        logger(`window reduced and is now smaller or equal to medium`);
                    }
                }
                if (this.previousWindowWidth > SCREEN_WIDTH_SMALL) {
                    if (newWindowWidth <= SCREEN_WIDTH_SMALL) {
                        // need to re-render carousel
                        reRenderRequired = true;
                        logger(`window reduced and is now smaller or equal to small`);
                    }
                }
            } else {
                if (this.previousWindowWidth <= SCREEN_WIDTH_SMALL) {
                    if (newWindowWidth > SCREEN_WIDTH_SMALL) {
                        // need to re-render carousel
                        logger(`window increased and is now larger than small`);
                        reRenderRequired = true;
                    }
                }
                if (this.previousWindowWidth <= SCREEN_WIDTH_MEDIUM) {
                    if (newWindowWidth > SCREEN_WIDTH_MEDIUM) {
                        logger(`window increased and is now larger than medium`);
                        // need to re-render carousel
                        reRenderRequired = true;
                    }
                }
                if (this.previousWindowWidth <= SCREEN_WIDTH_LARGE) {
                    if (newWindowWidth > SCREEN_WIDTH_LARGE) {
                        logger(`window increased and is now larger than large`);
                        // need to re-render carousel
                        reRenderRequired = true;
                    }
                }
            }
            this.previousWindowWidth = newWindowWidth;
            if (this.lastRenderedContainer && this.lastRenderedCollection && this.lastRenderedCollectionName && reRenderRequired) {
                this.setDisplayElementsForCollectionInContainer(this.lastRenderedContainer, this.lastRenderedCollectionName, this.lastRenderedCollection);
            }
        });


    }

    public createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement {
        const canDeleteItem = this.view.hasPermissionToDeleteItemInNamedCollection(collectionName, item);

        logger(`view ${this.view.getName()}: creating carousel item`);
        logger(item);

        const collectionConfig = this.view.getCollectionUIConfig();


        let childEl: HTMLElement = document.createElement(collectionConfig.resultsElement.type);
        browserUtil.addClasses(childEl, collectionConfig.resultsElement.classes);
        browserUtil.addAttributes(childEl, collectionConfig.resultsElement.attributes);


        if (collectionConfig.detail.background) {
            let backgroundEl = document.createElement(collectionConfig.detail.background.type);
            browserUtil.addClasses(backgroundEl, collectionConfig.detail.background.classes);
            browserUtil.addAttributes(backgroundEl, collectionConfig.detail.background.attributes);
            childEl.appendChild(backgroundEl);
            this.view.renderBackgroundForItemInNamedCollection(backgroundEl, collectionName, item);
        }


        // the content may be structured
        let textEl = childEl;
        if (collectionConfig.detail.containerClasses) {
            let contentEl: HTMLElement = document.createElement('div');
            browserUtil.addClasses(contentEl, collectionConfig.detail.containerClasses);


            textEl = document.createElement(collectionConfig.detail.textElement.type);
            browserUtil.addClasses(textEl, collectionConfig.detail.textElement.type);
            browserUtil.addAttributes(textEl, collectionConfig.detail.textElement.attributes)

            contentEl.appendChild(textEl);

            if (collectionConfig.extraActions || collectionConfig.detail.delete) {
                let buttonsEl = document.createElement(this.config.actionContainer.type);
                browserUtil.addClasses(buttonsEl, this.config.actionContainer.classes);

                contentEl.appendChild(buttonsEl);


                if (collectionConfig.extraActions) {
                    collectionConfig.extraActions.forEach((extraAction) => {
                        const hasPermissionForAction = this.view.hasPermissionForActionOnItemInNamedCollection(extraAction.name, collectionName, item);
                        if (hasPermissionForAction) {

                            let action: HTMLElement = document.createElement('button');
                            action.setAttribute('type', 'button');
                            browserUtil.addClasses(action, extraAction.button.classes);
                            browserUtil.addAttributes(action, extraAction.button.attributes);
                            if (extraAction.button.text) {
                                action.innerHTML = extraAction.button.text;
                            }
                            if (extraAction.button.iconClasses) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, extraAction.button.iconClasses);
                                iconEl.setAttribute(EXTRA_ACTION_ATTRIBUTE_NAME, extraAction.name);
                                action.appendChild(iconEl);
                            }
                            action.setAttribute(EXTRA_ACTION_ATTRIBUTE_NAME, extraAction.name);

                            action.addEventListener('click', (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                this.eventHandler.eventActionClicked(event);
                            });
                            buttonsEl.appendChild(action);
                        }
                    });
                }
                if (collectionConfig.detail.delete && collectionConfig && canDeleteItem) {
                    let deleteButtonEl: HTMLElement = document.createElement('button');
                    deleteButtonEl.setAttribute('type', 'button');
                    browserUtil.addClasses(deleteButtonEl, collectionConfig.detail.delete.classes);
                    browserUtil.addAttributes(deleteButtonEl, collectionConfig.detail.delete.attributes);
                    if (collectionConfig.detail.delete.text) {
                        deleteButtonEl.innerHTML = collectionConfig.detail.delete.text;
                    }
                    if (collectionConfig.detail.delete.iconClasses) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.detail.delete.iconClasses);
                        deleteButtonEl.appendChild(iconEl);
                    }
                    deleteButtonEl.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.eventHandler.eventDeleteClickItem(event);
                    });
                    buttonsEl.appendChild(deleteButtonEl);
                }

            }

            childEl.appendChild(contentEl);

            if (collectionConfig.detail.drag) {
                childEl.setAttribute('draggable', 'true');
                childEl.addEventListener('dragstart', this.eventHandler.eventStartDrag);
            }
            // add selection actions
            if (collectionConfig.detail.select) {
                childEl.addEventListener('click', this.eventHandler.eventClickItem);
            }
        }


        const displayText = this.view.renderDisplayForItemInNamedCollection(textEl, collectionName, item);
        // add icons


        // add modifiers for patient state
        if (collectionConfig.modifiers) {
            const modifier = this.view.getModifierForItemInNamedCollection(collectionName, item);
            const secondModifier = this.view.getSecondaryModifierForItemInNamedCollection(collectionName, item);
            switch (modifier) {
                case Modifier.normal: {
                    logger(`view ${this.view.getName()}: normal item`);
                    browserUtil.addClasses(childEl, collectionConfig.modifiers.normal);
                    if (collectionConfig.icons && collectionConfig.icons.normal) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.icons.normal);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, collectionConfig.modifiers.normal);
                            browserUtil.addClasses(childEl, collectionConfig.modifiers.warning);
                            if (collectionConfig.icons && collectionConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.warning);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (collectionConfig.icons && collectionConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.active);
                                textEl.appendChild(iconEl);
                            }
                        }
                    }

                    break;
                }
                case Modifier.active: {
                    logger(`view ${this.view.getName()}: active item`);
                    browserUtil.addClasses(childEl, collectionConfig.modifiers.active);
                    if (collectionConfig.icons && collectionConfig.icons.active) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.icons.active);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, collectionConfig.modifiers.active);
                            browserUtil.addClasses(childEl, collectionConfig.modifiers.warning);
                            if (collectionConfig.icons && collectionConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.warning);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
                case Modifier.inactive: {
                    logger(`view ${this.view.getName()}: inactive item`);
                    browserUtil.addClasses(childEl, collectionConfig.modifiers.inactive);
                    if (collectionConfig.icons && collectionConfig.icons.inactive) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.icons.inactive);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            if (collectionConfig.icons && collectionConfig.icons.warning) {
                                browserUtil.removeClasses(childEl, collectionConfig.modifiers.inactive);
                                browserUtil.addClasses(childEl, collectionConfig.modifiers.warning);
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.warning);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (collectionConfig.icons && collectionConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.active);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }
        return childEl;
    }

    public setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void {
        logger(`view ${this.view.getName()}: creating carousel results`);
        logger(newState);
        // remove the previous items from list
        browserUtil.removeAllChildren(containerEl);

        // need to break the items up by row, and the last row is active (assumes increasing time order)
        const numberOfResults = newState.length;

        // number of items per row depends on view port
        let itemsPerRow = this.config.itemsPerRow.xlarge;
        if (window.innerWidth <= SCREEN_WIDTH_LARGE) {
            itemsPerRow = this.config.itemsPerRow.large;
        }
        if (window.innerWidth <= SCREEN_WIDTH_MEDIUM) {
            itemsPerRow = this.config.itemsPerRow.medium;
        }
        if (window.innerWidth <= SCREEN_WIDTH_SMALL) {
            itemsPerRow = this.config.itemsPerRow.small;
        }


        const numberOfRows = Math.ceil(numberOfResults / itemsPerRow);
        logger(`view ${this.view.getName()}: creating carousel with number of results per row of ${itemsPerRow} with rows ${numberOfRows}`);
        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            // create the row
            let rowContainerEl = document.createElement(this.config.rowContainer.type);
            browserUtil.addClasses(rowContainerEl, this.config.rowContainer.classes);
            browserUtil.addAttributes(rowContainerEl, this.config.rowContainer.attributes);
            //browserUtil.addAttributes(rowContainerEl,[{name:'style',value:'display:block'}]);

            let rowEl = document.createElement(this.config.row.type);
            browserUtil.addClasses(rowEl, this.config.row.classes);
            browserUtil.addAttributes(rowEl, this.config.row.attributes);
            rowContainerEl.appendChild(rowEl);

            // if this the active row?
            if (((rowIndex === 0) && this.config.activeRowPosition === RowPosition.first) ||
                ((rowIndex === (numberOfRows - 1)) && this.config.activeRowPosition === RowPosition.last)) {
                browserUtil.addClasses(rowContainerEl, this.config.activeRow.classes);
                browserUtil.addAttributes(rowContainerEl, this.config.activeRow.attributes);
            }

            let itemIndex = rowIndex * itemsPerRow;

            while (itemIndex < ((rowIndex + 1) * itemsPerRow) && (itemIndex < numberOfResults)) {
                logger(`rowIndex ${rowIndex} item index ${itemIndex}`);
                const item = newState[itemIndex];


                let itemContainerEl = rowEl;
                if (this.config.multipleItemsPerRowContainer) {
                    itemContainerEl = document.createElement(this.config.multipleItemsPerRowContainer.type);
                    browserUtil.addClasses(itemContainerEl, this.config.multipleItemsPerRowContainer.classes);
                    browserUtil.addAttributes(itemContainerEl, this.config.multipleItemsPerRowContainer.attributes);
                    rowEl.appendChild(itemContainerEl);
                }

                const itemEl = this.createDisplayElementForCollectionItem(collectionName, item);
                itemContainerEl.appendChild(itemEl);

                ContextualInformationHelper.getInstance().addContextToElement(this.view.getName(), collectionName, item, itemEl, true, TogglePlacement.bottom);
                itemEl.addEventListener('contextmenu', ContextualInformationHelper.getInstance().handleContextMenu);

                itemIndex++;
            }


            containerEl.appendChild(rowContainerEl);

        }
        if (!browserUtil.isMobileDevice()) $('[data-toggle="tooltip"]').tooltip();

        this.lastRenderedContainer = containerEl;
        this.lastRenderedCollectionName = collectionName;
        this.lastRenderedCollection = newState;

    }

    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
    }

    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
    }

    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
    }

}
