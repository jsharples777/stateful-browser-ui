import debug from 'debug';
import {CollectionViewRenderer} from "../interface/CollectionViewRenderer";
import {CollectionViewEventHandler} from "../interface/CollectionViewEventHandler";
import {CollectionView} from "../interface/CollectionView";

import {ContextualInformationHelper} from "../../context/ContextualInformationHelper";
import {
    CollectionViewDOMConfig,
    EXTRA_ACTION_ATTRIBUTE_NAME,
    ListViewRuntimeConfig,
    Modifier
} from "../../ConfigurationTypes";
import {browserUtil} from "browser-state-management";

const logger = debug('list-view-renderer-with-context');
const paginationLogger = debug('list-view-renderer-with-context:pagination')

export class ListViewRendererUsingContext implements CollectionViewRenderer {
    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected runtimeConfig: ListViewRuntimeConfig | undefined;
    private stateBuffer: any[] = [];
    private containerEl?: HTMLElement;
    private collectionName?: string;
    private currentPage: number = 0;
    private observer: IntersectionObserver | null = null;
    private currentObservedTarget: HTMLElement | null = null;

    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler, runtimeConfig?: ListViewRuntimeConfig) {
        this.view = view;
        this.eventHandler = eventHandler;
        this.runtimeConfig = runtimeConfig;
        this.renderNextPage = this.renderNextPage.bind(this);
    }

    public createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement {
        const canDeleteItem: boolean = this.view.hasPermissionToDeleteItemInNamedCollection(collectionName, item);
        const uiConfig: CollectionViewDOMConfig = this.view.getCollectionUIConfig();

        logger(`view ${this.view.getName()}: creating List item`);
        logger(item);

        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);

        let childEl: HTMLElement = document.createElement(uiConfig.resultsElement.type);
        browserUtil.addClasses(childEl, uiConfig.resultsElement.classes);
        browserUtil.addAttributes(childEl, uiConfig.resultsElement.attributes);
        // the content may be structured
        let textEl = childEl;
        if (uiConfig.detail.containerClasses) {
            let contentEl: HTMLElement = document.createElement('div');
            browserUtil.addClasses(contentEl, uiConfig.detail.containerClasses);


            textEl = document.createElement(uiConfig.detail.textElement.type);
            browserUtil.addClasses(textEl, uiConfig.detail.textElement.classes);
            browserUtil.addAttributes(textEl, uiConfig.detail.textElement.attributes);

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
                    deleteButtonEl.appendChild(iconEl);
                }
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
        this.view.renderDisplayForItemInNamedCollection(textEl, collectionName, item);

        // add icons
        const icons: string[] = this.view.getItemIcons(collectionName, item);
        icons.forEach((icon) => {
            let iconEl = document.createElement('i');
            browserUtil.addClasses(iconEl, icon);
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
                    logger(`view ${this.view.getName()}: normal item`);
                    browserUtil.addClasses(childEl, uiConfig.modifiers.normal);
                    if (uiConfig.icons && uiConfig.icons.normal) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.normal);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, uiConfig.modifiers.normal);
                            browserUtil.addClasses(childEl, uiConfig.modifiers.warning);
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (uiConfig.icons && uiConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.active);
                                textEl.appendChild(iconEl);
                            }
                        }
                    }

                    break;
                }
                case Modifier.active: {
                    logger(`view ${this.view.getName()}: active item`);
                    browserUtil.addClasses(childEl, uiConfig.modifiers.active);
                    if (uiConfig.icons && uiConfig.icons.active) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.active);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(childEl, uiConfig.modifiers.active);
                            browserUtil.addClasses(childEl, uiConfig.modifiers.warning);
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
                case Modifier.inactive: {
                    logger(`view ${this.view.getName()}: inactive item`);
                    browserUtil.addClasses(childEl, uiConfig.modifiers.inactive);
                    if (uiConfig.icons && uiConfig.icons.inactive) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.inactive);
                        textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                browserUtil.removeClasses(childEl, uiConfig.modifiers.inactive);
                                browserUtil.addClasses(childEl, uiConfig.modifiers.warning);
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (uiConfig.icons && uiConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.active);
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
                        textEl.appendChild(iconEl);
                    }
                    break;
                }
            }
        }
        return childEl;
    }

    public setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void {
        this.currentPage = 0;
        this.stateBuffer = newState;
        this.containerEl = containerEl;
        this.collectionName = collectionName;
        this.setDisplayElementsForCollectionInContainerForNextPage(containerEl, collectionName, newState);
    }

    public setDisplayElementsForCollectionInContainerForNextPage(containerEl: HTMLElement, collectionName: string, newState: any): void {
        paginationLogger(`view ${this.view.getName()}: creating Results`);
        logger(newState);
        this.currentPage++;

        let isLazyLoading: boolean = false;
        let itemPageSize = this.stateBuffer.length;

        if (this.runtimeConfig) {
            itemPageSize = this.runtimeConfig.lazyLoadPageSize;
            isLazyLoading = true;
        } else {
            if (itemPageSize > 50) {
                this.runtimeConfig = {
                    lazyLoadPageSize: 50
                };
                itemPageSize = 50;
                isLazyLoading = true;
            }
        }

        // remove the previous items from list
        if (this.currentPage === 1) {
            browserUtil.removeAllChildren(containerEl);
        }

        const startItemIndex = (this.currentPage - 1) * itemPageSize;
        let endItemIndex = (this.currentPage * itemPageSize);
        if (this.stateBuffer.length < endItemIndex) {
            endItemIndex = this.stateBuffer.length;
        }
        paginationLogger(`loading items from ${startItemIndex} to ${endItemIndex}`);

        // add the new children
        let lastChildEl;
        for (let index = startItemIndex; index < endItemIndex; index++) {
            const item = this.stateBuffer[index];
            lastChildEl = ContextualInformationHelper.getInstance().insertDisplayElementForCollectionItem(this.view, this, containerEl, collectionName, item);
        }


        paginationLogger(`Is lazy loading? ${isLazyLoading} and current page count is ${this.currentPage} with page size ${itemPageSize}`);
        if (isLazyLoading && (this.stateBuffer.length > (this.currentPage * itemPageSize))) {
            if (lastChildEl) {
                this.currentObservedTarget = lastChildEl;
                if (this.observer === null) {
                    paginationLogger(`Creating new observer`);
                    // put an observer on the last child
                    this.observer = new IntersectionObserver(this.renderNextPage);//,{root:this.containerEl,threshold:0.0});
                }

                this.observer.observe(lastChildEl);
            }

        }


        if (!browserUtil.isMobileDevice()) $('[data-toggle="tooltip"]').tooltip();
    }

    onDocumentLoaded(): void {
    }

    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        ContextualInformationHelper.getInstance().insertDisplayElementForCollectionItem(this.view, this, containerEl, collectionName, item, true);
    }

    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        ContextualInformationHelper.getInstance().removeDisplayElementForCollectionItem(this.view, this, containerEl, collectionName, item);
    }

    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        ContextualInformationHelper.getInstance().updateDisplayElementForCollectionItem(this.view, this, containerEl, collectionName, item);
    }

    protected renderNextPage(entries: any): void {
        if (entries[0].intersectionRatio <= 0) return;

        paginationLogger('rendering next page');
        if (this.observer && this.currentObservedTarget) {
            paginationLogger('unobserving current target');
            paginationLogger(this.currentObservedTarget);
            this.observer.unobserve(this.currentObservedTarget);
            this.currentObservedTarget = null;
        }
        if (this.containerEl && this.collectionName) this.setDisplayElementsForCollectionInContainerForNextPage(this.containerEl, this.collectionName, this.stateBuffer);
    }

}
