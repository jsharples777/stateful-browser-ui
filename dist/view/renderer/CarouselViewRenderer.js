import debug from 'debug';
import { EXTRA_ACTION_ATTRIBUTE_NAME, Modifier, RowPosition, SCREEN_WIDTH_LARGE, SCREEN_WIDTH_MEDIUM, SCREEN_WIDTH_SMALL } from "../../ConfigurationTypes";
import { browserUtil } from "browser-state-management";
const avLogger = debug('carousel-renderer');
export class CarouselViewRenderer {
    constructor(view, eventHandler, config) {
        this.lastRenderedContainer = null;
        this.lastRenderedCollectionName = null;
        this.lastRenderedCollection = null;
        this.previousWindowWidth = 0;
        this.view = view;
        this.eventHandler = eventHandler;
        this.config = config;
    }
    removeDisplayElementForCollectionItem(containerEl, collectionName, item) {
        throw new Error('Method not implemented.');
    }
    updateDisplayElementForCollectionItem(containerEl, collectionName, item) {
        throw new Error('Method not implemented.');
    }
    insertDisplayElementForCollectionItem(containerEl, collectionName, item) {
        throw new Error('Method not implemented.');
    }
    onDocumentLoaded() {
        // we need to track window resizing
        this.previousWindowWidth = window.innerWidth;
        window.addEventListener('resize', (event) => {
            const newWindowWidth = window.innerWidth;
            let reRenderRequired = false;
            if (newWindowWidth < this.previousWindowWidth) {
                if (this.previousWindowWidth > SCREEN_WIDTH_LARGE) {
                    if (newWindowWidth <= SCREEN_WIDTH_LARGE) {
                        // need to re-render carousel
                        reRenderRequired = true;
                        avLogger(`window reduced and is now smaller or equal to large`);
                    }
                }
                if (this.previousWindowWidth > SCREEN_WIDTH_MEDIUM) {
                    if (newWindowWidth <= SCREEN_WIDTH_MEDIUM) {
                        // need to re-render carousel
                        reRenderRequired = true;
                        avLogger(`window reduced and is now smaller or equal to medium`);
                    }
                }
                if (this.previousWindowWidth > SCREEN_WIDTH_SMALL) {
                    if (newWindowWidth <= SCREEN_WIDTH_SMALL) {
                        // need to re-render carousel
                        reRenderRequired = true;
                        avLogger(`window reduced and is now smaller or equal to small`);
                    }
                }
            }
            else {
                if (this.previousWindowWidth <= SCREEN_WIDTH_SMALL) {
                    if (newWindowWidth > SCREEN_WIDTH_SMALL) {
                        // need to re-render carousel
                        avLogger(`window increased and is now larger than small`);
                        reRenderRequired = true;
                    }
                }
                if (this.previousWindowWidth <= SCREEN_WIDTH_MEDIUM) {
                    if (newWindowWidth > SCREEN_WIDTH_MEDIUM) {
                        avLogger(`window increased and is now larger than medium`);
                        // need to re-render carousel
                        reRenderRequired = true;
                    }
                }
                if (this.previousWindowWidth <= SCREEN_WIDTH_LARGE) {
                    if (newWindowWidth > SCREEN_WIDTH_LARGE) {
                        avLogger(`window increased and is now larger than large`);
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
    createDisplayElementForCollectionItem(collectionName, item) {
        const dataSourceKeyId = this.view.getDataSourceKeyId();
        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);
        const canDeleteItem = this.view.hasPermissionToDeleteItemInNamedCollection(collectionName, item);
        avLogger(`view ${this.view.getName()}: creating carousel item`);
        avLogger(item);
        const collectionConfig = this.view.getCollectionUIConfig();
        let childEl = document.createElement(collectionConfig.resultsElement.type);
        browserUtil.addClasses(childEl, collectionConfig.resultsElement.classes);
        browserUtil.addAttributes(childEl, collectionConfig.resultsElement.attributes);
        childEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
        childEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
        if (collectionConfig.detail.background) {
            let backgroundEl = document.createElement(collectionConfig.detail.background.type);
            browserUtil.addClasses(backgroundEl, collectionConfig.detail.background.classes);
            browserUtil.addAttributes(backgroundEl, collectionConfig.detail.background.attributes);
            backgroundEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
            backgroundEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
            childEl.appendChild(backgroundEl);
            this.view.renderBackgroundForItemInNamedCollection(backgroundEl, collectionName, item);
        }
        // the content may be structured
        let textEl = childEl;
        if (collectionConfig.detail.containerClasses) {
            let contentEl = document.createElement('div');
            browserUtil.addClasses(contentEl, collectionConfig.detail.containerClasses);
            contentEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
            contentEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
            textEl = document.createElement(collectionConfig.detail.textElement.type);
            browserUtil.addClasses(textEl, collectionConfig.detail.textElement.type);
            browserUtil.addAttributes(textEl, collectionConfig.detail.textElement.attributes);
            textEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
            textEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
            contentEl.appendChild(textEl);
            if (collectionConfig.extraActions || collectionConfig.detail.delete) {
                let buttonsEl = document.createElement(this.config.actionContainer.type);
                browserUtil.addClasses(buttonsEl, this.config.actionContainer.classes);
                contentEl.appendChild(buttonsEl);
                if (collectionConfig.extraActions) {
                    collectionConfig.extraActions.forEach((extraAction) => {
                        const hasPermissionForAction = this.view.hasPermissionForActionOnItemInNamedCollection(extraAction.name, collectionName, item);
                        if (hasPermissionForAction) {
                            let action = document.createElement('button');
                            action.setAttribute('type', 'button');
                            browserUtil.addClasses(action, extraAction.button.classes);
                            browserUtil.addAttributes(action, extraAction.button.attributes);
                            if (extraAction.button.text) {
                                action.innerHTML = extraAction.button.text;
                            }
                            if (extraAction.button.iconClasses) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, extraAction.button.iconClasses);
                                iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                                iconEl.setAttribute(EXTRA_ACTION_ATTRIBUTE_NAME, extraAction.name);
                                action.appendChild(iconEl);
                            }
                            action.setAttribute(collectionConfig.keyId, resultDataKeyId);
                            action.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
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
                    let deleteButtonEl = document.createElement('button');
                    deleteButtonEl.setAttribute('type', 'button');
                    browserUtil.addClasses(deleteButtonEl, collectionConfig.detail.delete.classes);
                    browserUtil.addAttributes(deleteButtonEl, collectionConfig.detail.delete.attributes);
                    if (collectionConfig.detail.delete.text) {
                        deleteButtonEl.innerHTML = collectionConfig.detail.delete.text;
                    }
                    if (collectionConfig.detail.delete.iconClasses) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.detail.delete.iconClasses);
                        iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                        deleteButtonEl.appendChild(iconEl);
                    }
                    deleteButtonEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                    deleteButtonEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
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
        // add the key ids for selection
        textEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
        textEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
        const displayText = this.view.renderDisplayForItemInNamedCollection(textEl, collectionName, item);
        // add icons
        // add modifiers for patient state
        if (collectionConfig.modifiers) {
            const modifier = this.view.getModifierForItemInNamedCollection(collectionName, item);
            const secondModifier = this.view.getSecondaryModifierForItemInNamedCollection(collectionName, item);
            switch (modifier) {
                case Modifier.normal: {
                    avLogger(`view ${this.view.getName()}: normal item`);
                    browserUtil.addClasses(childEl, collectionConfig.modifiers.normal);
                    if (collectionConfig.icons && collectionConfig.icons.normal) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.icons.normal);
                        iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                        textEl.appendChild(iconEl);
                    }
                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, collectionConfig.modifiers.normal);
                            browserUtil.addClasses(childEl, collectionConfig.modifiers.warning);
                            if (collectionConfig.icons && collectionConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.warning);
                                iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (collectionConfig.icons && collectionConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.active);
                                iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                        }
                    }
                    break;
                }
                case Modifier.active: {
                    avLogger(`view ${this.view.getName()}: active item`);
                    browserUtil.addClasses(childEl, collectionConfig.modifiers.active);
                    if (collectionConfig.icons && collectionConfig.icons.active) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.icons.active);
                        iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                        textEl.appendChild(iconEl);
                    }
                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, collectionConfig.modifiers.active);
                            browserUtil.addClasses(childEl, collectionConfig.modifiers.warning);
                            if (collectionConfig.icons && collectionConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.warning);
                                iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
                case Modifier.inactive: {
                    avLogger(`view ${this.view.getName()}: inactive item`);
                    browserUtil.addClasses(childEl, collectionConfig.modifiers.inactive);
                    if (collectionConfig.icons && collectionConfig.icons.inactive) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, collectionConfig.icons.inactive);
                        iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                        textEl.appendChild(iconEl);
                    }
                    switch (secondModifier) {
                        case Modifier.warning: {
                            if (collectionConfig.icons && collectionConfig.icons.warning) {
                                browserUtil.removeClasses(childEl, collectionConfig.modifiers.inactive);
                                browserUtil.addClasses(childEl, collectionConfig.modifiers.warning);
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.warning);
                                iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (collectionConfig.icons && collectionConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, collectionConfig.icons.active);
                                iconEl.setAttribute(collectionConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, collectionConfig.viewConfig.dataSourceId);
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
    setDisplayElementsForCollectionInContainer(containerEl, collectionName, newState) {
        avLogger(`view ${this.view.getName()}: creating carousel results`);
        avLogger(newState);
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
        avLogger(`view ${this.view.getName()}: creating carousel with number of results per row of ${itemsPerRow} with rows ${numberOfRows}`);
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
                avLogger(`rowIndex ${rowIndex} item index ${itemIndex}`);
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
                itemIndex++;
            }
            containerEl.appendChild(rowContainerEl);
        }
        if (!browserUtil.isMobileDevice())
            $('[data-toggle="tooltip"]').tooltip();
        this.lastRenderedContainer = containerEl;
        this.lastRenderedCollectionName = collectionName;
        this.lastRenderedCollection = newState;
    }
}
//# sourceMappingURL=CarouselViewRenderer.js.map