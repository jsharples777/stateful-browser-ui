import debug from 'debug';
import {CollectionViewRenderer} from "../interface/CollectionViewRenderer";
import {CollectionView} from "../interface/CollectionView";
import {CollectionViewEventHandler} from "../interface/CollectionViewEventHandler";
import {CollectionRendererHelper} from "./CollectionRendererHelper";
import {CollectionViewDOMConfig, EXTRA_ACTION_ATTRIBUTE_NAME, Modifier} from "../../ConfigurationTypes";
import {browserUtil} from "browser-state-management";

const avLogger = debug('list-view-renderer');

export class ListViewRenderer implements CollectionViewRenderer {
    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected helper: CollectionRendererHelper;

    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler) {
        this.view = view;
        this.eventHandler = eventHandler;
        this.helper = new CollectionRendererHelper(view, this);
    }

    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        this.helper.removeDisplayElementForCollectionItem(containerEl, collectionName, item);
    }

    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        this.helper.updateDisplayElementForCollectionItem(containerEl, collectionName, item);
    }

    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        this.helper.insertDisplayElementForCollectionItem(containerEl, collectionName, item);
    }

    public createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement {
        const canDeleteItem: boolean = this.view.hasPermissionToDeleteItemInNamedCollection(collectionName, item);
        const uiConfig: CollectionViewDOMConfig = this.view.getCollectionUIConfig();
        const dataSourceKeyId = this.view.getDataSourceKeyId();

        avLogger(`view ${this.view.getName()}: creating List item`);
        avLogger(item);

        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);

        let childEl: HTMLElement = document.createElement(uiConfig.resultsElement.type);
        browserUtil.addClasses(childEl, uiConfig.resultsElement.classes);
        browserUtil.addAttributes(childEl, uiConfig.resultsElement.attributes);
        childEl.setAttribute(uiConfig.keyId, resultDataKeyId);
        childEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
        // the content may be structured
        let textEl = childEl;
        if (uiConfig.detail.containerClasses) {
            let contentEl: HTMLElement = document.createElement('div');
            browserUtil.addClasses(contentEl, uiConfig.detail.containerClasses);
            contentEl.setAttribute(uiConfig.keyId, resultDataKeyId);
            contentEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);


            textEl = document.createElement(uiConfig.detail.textElement.type);
            browserUtil.addClasses(textEl, uiConfig.detail.textElement.classes);
            browserUtil.addAttributes(textEl, uiConfig.detail.textElement.attributes);
            textEl.setAttribute(uiConfig.keyId, resultDataKeyId);
            textEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);

            contentEl.appendChild(textEl);

            if (uiConfig.detail.background) {
                let imgEl = document.createElement(uiConfig.detail.background.type);
                browserUtil.addClasses(imgEl, uiConfig.detail.background.classes);
                imgEl.setAttribute('src', this.view.getBackgroundImageForItemInNamedCollection(collectionName, item));
                childEl.appendChild(imgEl);
            }

            let buttonsEl = document.createElement('div');
            contentEl.appendChild(buttonsEl);

            if (uiConfig.detail.badge) {
                const badgeValue = this.view.getBadgeValueForItemInNamedCollection(collectionName, item);
                if (badgeValue > 0) {
                    let badgeEl: HTMLElement = document.createElement(uiConfig.detail.badge.type);
                    browserUtil.addClasses(badgeEl, uiConfig.detail.badge.classes);
                    browserUtil.addAttributes(badgeEl, uiConfig.detail.badge.attributes);
                    badgeEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                    badgeEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                    buttonsEl.appendChild(badgeEl);
                    badgeEl.innerHTML = `&nbsp;&nbsp;&nbsp;${badgeValue}&nbsp;&nbsp;&nbsp;`;
                }
            }
            if (uiConfig.detail.secondBadge) {
                const badgeValue = this.view.getSecondaryBadgeValueForItemInNamedCollection(collectionName, item);
                if (badgeValue > 0) {
                    let badgeEl: HTMLElement = document.createElement(uiConfig.detail.secondBadge.type);
                    browserUtil.addClasses(badgeEl, uiConfig.detail.secondBadge.classes);
                    browserUtil.addAttributes(badgeEl, uiConfig.detail.secondBadge.attributes);
                    badgeEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                    badgeEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                    buttonsEl.appendChild(badgeEl);
                    badgeEl.innerHTML = `&nbsp;&nbsp;&nbsp;${badgeValue}&nbsp;&nbsp;&nbsp;`;
                }
            }
            if (uiConfig.detail.thirdBadge) {
                const badgeValue = this.view.getTertiaryBadgeValueForItemInNamedCollection(collectionName, item);
                if (badgeValue > 0) {
                    let badgeEl: HTMLElement = document.createElement(uiConfig.detail.thirdBadge.type);
                    browserUtil.addClasses(badgeEl, uiConfig.detail.thirdBadge.classes);
                    browserUtil.addAttributes(badgeEl, uiConfig.detail.thirdBadge.attributes);
                    badgeEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                    badgeEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                    buttonsEl.appendChild(badgeEl);
                    badgeEl.innerHTML = `&nbsp;&nbsp;&nbsp;${badgeValue}&nbsp;&nbsp;&nbsp;`;
                }
            }

            if (uiConfig.extraActions) {
                uiConfig.extraActions.forEach((extraAction) => {
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
                            iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                            iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                            iconEl.setAttribute(EXTRA_ACTION_ATTRIBUTE_NAME, extraAction.name);
                            action.appendChild(iconEl);
                        }
                        action.setAttribute(uiConfig.keyId, resultDataKeyId);
                        action.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
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
            if (uiConfig.detail.delete && canDeleteItem) {
                let deleteButtonEl: HTMLElement = document.createElement('button');
                deleteButtonEl.setAttribute('type', 'button');
                browserUtil.addClasses(deleteButtonEl, uiConfig.detail.delete.classes);
                browserUtil.addAttributes(deleteButtonEl, uiConfig.detail.delete.attributes);
                if (uiConfig.detail.delete.text) {
                    deleteButtonEl.innerHTML = uiConfig.detail.delete.text;
                }
                if (uiConfig.detail.delete.iconClasses) {
                    let iconEl = document.createElement('i');
                    browserUtil.addClasses(iconEl, uiConfig.detail.delete.iconClasses);
                    iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                    iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                    deleteButtonEl.appendChild(iconEl);
                }
                deleteButtonEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                deleteButtonEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                deleteButtonEl.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.eventHandler.eventDeleteClickItem(event);
                });
                buttonsEl.appendChild(deleteButtonEl);
            }
            childEl.appendChild(contentEl);

            if (uiConfig.detail.drag) {
                childEl.setAttribute('draggable', 'true');
                childEl.addEventListener('dragstart', this.eventHandler.eventStartDrag);
            }
            // add selection actions
            if (uiConfig.detail.select) {
                childEl.addEventListener('click', this.eventHandler.eventClickItem);
            }
        }


        // add the key ids for selection
        textEl.setAttribute(uiConfig.keyId, resultDataKeyId);
        textEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
        this.view.renderDisplayForItemInNamedCollection(textEl, collectionName, item);

        // add icons
        const icons: string[] = this.view.getItemIcons(collectionName, item);
        icons.forEach((icon) => {
            let iconEl = document.createElement('i');
            browserUtil.addClasses(iconEl, icon);
            iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
            iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
            if (this.view.prependItemIcons(collectionName, item)) {
                textEl.prepend(iconEl);
            } else {
                textEl.append(iconEl);
            }
        });

        // add modifiers for patient state
        if (uiConfig.modifiers) {
            const modifier = this.view.getModifierForItemInNamedCollection(collectionName, item);
            const secondModifier = this.view.getSecondaryModifierForItemInNamedCollection(collectionName, item);
            switch (modifier) {
                case Modifier.normal: {
                    avLogger(`view ${this.view.getName()}: normal item`);
                    browserUtil.addClasses(childEl, uiConfig.modifiers.normal);
                    if (uiConfig.icons && uiConfig.icons.normal) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.normal);
                        iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, uiConfig.modifiers.normal);
                            browserUtil.addClasses(childEl, uiConfig.modifiers.warning);
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (uiConfig.icons && uiConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.active);
                                iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                        }
                    }

                    break;
                }
                case Modifier.active: {
                    avLogger(`view ${this.view.getName()}: active item`);
                    browserUtil.addClasses(childEl, uiConfig.modifiers.active);
                    if (uiConfig.icons && uiConfig.icons.active) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.active);
                        iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, uiConfig.modifiers.active);
                            browserUtil.addClasses(childEl, uiConfig.modifiers.warning);
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
                case Modifier.inactive: {
                    avLogger(`view ${this.view.getName()}: inactive item`);
                    browserUtil.addClasses(childEl, uiConfig.modifiers.inactive);
                    if (uiConfig.icons && uiConfig.icons.inactive) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.inactive);
                        iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                browserUtil.removeClasses(childEl, uiConfig.modifiers.inactive);
                                browserUtil.addClasses(childEl, uiConfig.modifiers.warning);
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (uiConfig.icons && uiConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.active);
                                iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                                iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
                case Modifier.warning: {
                    browserUtil.removeClasses(childEl, uiConfig.modifiers.normal);
                    browserUtil.addClasses(childEl, uiConfig.modifiers.warning);
                    if (uiConfig.icons && uiConfig.icons.warning) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                        iconEl.setAttribute(uiConfig.keyId, resultDataKeyId);
                        iconEl.setAttribute(dataSourceKeyId, uiConfig.viewConfig.dataSourceId);
                        textEl.appendChild(iconEl);
                    }
                    break;
                }
            }
        }
        return childEl;
    }

    public setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void {
        avLogger(`view ${this.view.getName()}: creating Results`);
        avLogger(newState);
        // remove the previous items from list
        browserUtil.removeAllChildren(containerEl);

        // add the new children
        newState.map((item: any, index: number) => {
            const childEl = this.createDisplayElementForCollectionItem(collectionName, item);
            // add draggable actions
            avLogger(`view ${this.view.getName()}:  Adding child ${this.view.getIdForItemInNamedCollection(collectionName, item)}`);
            containerEl.appendChild(childEl);
        });
        if (!browserUtil.isMobileDevice()) $('[data-toggle="tooltip"]').tooltip();
    }

    onDocumentLoaded(): void {
    }


}
