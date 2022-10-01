import debug from 'debug';
import { AbstractCollectionView } from "../view/implementation/AbstractCollectionView";
import { EXTRA_ACTION_ATTRIBUTE_NAME } from "../ConfigurationTypes";
import { browserUtil, CollectionFilterProcessor } from "browser-state-management";
const logger = debug('context-helper');
export var TogglePlacement;
(function (TogglePlacement) {
    TogglePlacement[TogglePlacement["top"] = 0] = "top";
    TogglePlacement[TogglePlacement["bottom"] = 1] = "bottom";
    TogglePlacement[TogglePlacement["right"] = 2] = "right";
    TogglePlacement[TogglePlacement["left"] = 3] = "left";
})(TogglePlacement || (TogglePlacement = {}));
const defaultIdentifier = function (name, item) {
    return '';
};
export class ContextualInformationHelper {
    constructor() {
        this.registry = [];
        this.menuDivEl = null;
        this.menuContentEl = null;
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
    }
    static getInstance() {
        if (!(ContextualInformationHelper._instance)) {
            ContextualInformationHelper._instance = new ContextualInformationHelper();
        }
        return ContextualInformationHelper._instance;
    }
    onDocumentLoaded() {
        // @ts-ignore
        document.addEventListener('click', this.hideContextMenu);
        this.menuDivEl = document.getElementById('contextmenu');
        this.menuContentEl = document.getElementById('contextMenuItems');
    }
    addContextFromView(view, internalType, displayName) {
        let context = this.ensureInRegistry(view.getName());
        context.view = view;
        context.defaultType.internalType = internalType;
        context.defaultType.displayName = displayName;
        context.defaultType.identifier = view.getItemId;
        context.defaultType.description = view.getItemDescription;
        return context;
    }
    addContextToElement(source, type, item, element, addTooltip = false, placement = TogglePlacement.bottom) {
        const context = this.ensureInRegistry(source);
        element.setAttribute(ContextualInformationHelper.SOURCE, context.source);
        element.setAttribute(ContextualInformationHelper.TYPE, context.defaultType.internalType);
        element.setAttribute(ContextualInformationHelper.DISPLAYNAME, context.defaultType.displayName);
        element.setAttribute(ContextualInformationHelper.IDENTIFIER, context.defaultType.identifier(type, item));
        element.setAttribute(ContextualInformationHelper.DESCRIPTION, context.defaultType.description(type, item));
        if (addTooltip && !browserUtil.isMobileDevice()) {
            element.setAttribute(ContextualInformationHelper.BOOTSTRAP_TOGGLE, ContextualInformationHelper.BOOTSTRAP_TOOLTIP_VALUE);
            element.setAttribute(ContextualInformationHelper.BOOTSTRAP_TOGGLE_HTML, ContextualInformationHelper.BOOTSTRAP_TOGGLE_HTML_VALUE);
            switch (placement) {
                case TogglePlacement.bottom: {
                    element.setAttribute(ContextualInformationHelper.BOOTSTRAP_PLACEMENT, ContextualInformationHelper.BOOTSTRAP_PLACEMENT_BOTTOM);
                    break;
                }
                case TogglePlacement.top: {
                    element.setAttribute(ContextualInformationHelper.BOOTSTRAP_PLACEMENT, ContextualInformationHelper.BOOTSTRAP_PLACEMENT_TOP);
                    break;
                }
                case TogglePlacement.left: {
                    element.setAttribute(ContextualInformationHelper.BOOTSTRAP_PLACEMENT, ContextualInformationHelper.BOOTSTRAP_PLACEMENT_LEFT);
                    break;
                }
                case TogglePlacement.right: {
                    element.setAttribute(ContextualInformationHelper.BOOTSTRAP_PLACEMENT, ContextualInformationHelper.BOOTSTRAP_PLACEMENT_RIGHT);
                    break;
                }
            }
            // @ts-ignore
            $('[data-toggle="tooltip"]').tooltip({ html: true });
        }
    }
    findContextFromEvent(event) {
        let result = null;
        if (event.target) {
            let target = event.target;
            // @ts-ignore
            result = this.findContextFromElement(event.target);
        }
        return result;
    }
    addActionToContext(context, actionName, displayName, handler, icon, permissionCheck) {
        let action = {
            actionName: actionName,
            displayName: displayName,
            handler: handler,
            hasPermission: permissionCheck,
            elementDefinition: {
                type: 'a',
                attributes: [{ name: 'href', value: '#' }],
                classes: 'list-group-item list-group-item-action bg-dark text-white',
            },
            iconClasses: icon
        };
        this.addContextActionToContext(context, action);
    }
    handleContextMenu(event) {
        logger('Right click');
        logger(event.target);
        // are we over a context sensitive item?
        // find a context if possible
        // @ts-ignore
        const context = this.findContextFromElement(event.target);
        logger(context);
        if (context && this.buildContextMenu(context)) {
            event.preventDefault();
            event.stopPropagation();
            this.showContextMenu(event);
            return false;
        }
        // otherwise let the default behaviour happen
        return true;
    }
    insertDisplayElementForCollectionItem(view, renderer, containerEl, collectionName, item, prepend = false) {
        // make sure we are not inserting the same element twice
        const resultDataKeyId = view.getIdForItemInNamedCollection(collectionName, item);
        const uiConfig = view.getCollectionUIConfig();
        const querySelector = `${uiConfig.resultsElement.type}[${ContextualInformationHelper.IDENTIFIER}="${resultDataKeyId}"]`;
        let childEl = containerEl.querySelector(querySelector);
        if (!childEl) {
            let shouldDisplayTheNewItem = true;
            // is there a filter in place?
            if (view.hasFilter()) {
                const currentFilter = view.getCurrentFilter();
                if (currentFilter) {
                    if (!CollectionFilterProcessor.doesItemMatchFilterConfig(collectionName, item, currentFilter)) {
                        shouldDisplayTheNewItem = false;
                    }
                }
            }
            if (shouldDisplayTheNewItem) {
                logger(`view ${view.getName()}: inserting result`);
                childEl = renderer.createDisplayElementForCollectionItem(collectionName, item);
                if (prepend) {
                    const firstChildEl = containerEl.firstChild;
                    if (firstChildEl) {
                        containerEl.insertBefore(childEl, firstChildEl);
                    }
                    else {
                        containerEl.appendChild(childEl);
                    }
                }
                else {
                    containerEl.appendChild(childEl);
                }
                this.addContextToElement(view.getName(), collectionName, item, childEl, true);
                childEl.addEventListener('contextmenu', ContextualInformationHelper.getInstance().handleContextMenu);
            }
        }
        return childEl;
    }
    removeDisplayElementForCollectionItem(view, renderer, containerEl, collectionName, item) {
        const resultDataKeyId = view.getIdForItemInNamedCollection(collectionName, item);
        const uiConfig = view.getCollectionUIConfig();
        const querySelector = `${uiConfig.resultsElement.type}[${ContextualInformationHelper.IDENTIFIER}="${resultDataKeyId}"]`;
        logger(`view ${view.getName()}: removing result with query selector "${querySelector}"`);
        const childEl = containerEl.querySelector(querySelector);
        if (childEl) {
            containerEl.removeChild(childEl);
        }
    }
    updateDisplayElementForCollectionItem(view, renderer, containerEl, collectionName, item) {
        const resultDataKeyId = view.getIdForItemInNamedCollection(collectionName, item);
        const uiConfig = view.getCollectionUIConfig();
        const querySelector = `${uiConfig.resultsElement.type}[${ContextualInformationHelper.IDENTIFIER}="${resultDataKeyId}"]`;
        logger(`view ${view.getName()}: updating result with query selector "${querySelector}"`);
        const oldChildEl = containerEl.querySelector(querySelector);
        if (oldChildEl) {
            const newChildEl = renderer.createDisplayElementForCollectionItem(collectionName, item);
            containerEl.insertBefore(newChildEl, oldChildEl);
            containerEl.removeChild(oldChildEl);
            this.addContextToElement(view.getName(), collectionName, item, newChildEl, true);
            newChildEl.addEventListener('contextmenu', ContextualInformationHelper.getInstance().handleContextMenu);
        }
        else {
            this.insertDisplayElementForCollectionItem(view, renderer, containerEl, collectionName, item, true);
        }
    }
    ensureInRegistry(source) {
        let result;
        let foundIndex = this.registry.findIndex((context) => context.source === source);
        if (foundIndex < 0) {
            result = {
                source: source,
                defaultType: {
                    internalType: '',
                    displayName: '',
                    identifier: defaultIdentifier,
                    description: defaultIdentifier,
                    actions: []
                }
            };
            this.registry.push(result);
        }
        else {
            result = this.registry[foundIndex];
        }
        return result;
    }
    findContextFromElement(element) {
        // do we have context information in this element?
        let result = null;
        const source = element.getAttribute(ContextualInformationHelper.SOURCE);
        if (source) {
            const type = element.getAttribute(ContextualInformationHelper.TYPE);
            const name = element.getAttribute(ContextualInformationHelper.DISPLAYNAME);
            const id = element.getAttribute(ContextualInformationHelper.IDENTIFIER);
            const desc = element.getAttribute(ContextualInformationHelper.DESCRIPTION);
            // @ts-ignore
            result = { source: source, internalType: type, displayName: name, identifier: id, description: desc };
        }
        else {
            const parent = element.parentElement;
            if (parent) {
                result = this.findContextFromElement(parent);
            }
        }
        return result;
    }
    findAllContextsFromElement(element, contexts) {
        // do we have context information in this element?
        const source = element.getAttribute(ContextualInformationHelper.SOURCE);
        if (source) {
            const type = element.getAttribute(ContextualInformationHelper.TYPE);
            const name = element.getAttribute(ContextualInformationHelper.DISPLAYNAME);
            const id = element.getAttribute(ContextualInformationHelper.IDENTIFIER);
            const desc = element.getAttribute(ContextualInformationHelper.DESCRIPTION);
            // @ts-ignore
            if (type && name && id && desc) {
                let result = {
                    source: source,
                    internalType: type,
                    displayName: name,
                    identifier: id,
                    description: desc
                };
                contexts.push(result);
            }
        }
        const parent = element.parentElement;
        if (parent) {
            this.findAllContextsFromElement(parent, contexts);
        }
    }
    addContextActionToContext(context, action) {
        logger(`Adding action to context ${context.source}`);
        logger(action);
        context.defaultType.actions.push(action);
    }
    buildContextMenu(context) {
        logger(`building context menu`);
        let result = false;
        // find the context for these details
        const contextDef = this.ensureInRegistry(context.source);
        let selectedItem = null;
        if (contextDef && contextDef.view && (contextDef.view instanceof AbstractCollectionView)) {
            logger(`collection view context - finding item with identifier ${context.identifier}`);
            let collectionView = (contextDef.view);
            let compareWith = {};
            // @ts-ignore
            compareWith[collectionView.getCollectionUIConfig().keyId] = context.identifier;
            selectedItem = collectionView.getItemInNamedCollection(context.internalType, compareWith);
        }
        logger(`found item for context menu`);
        logger(selectedItem);
        if (contextDef.defaultType.actions.length > 0) {
            if (this.menuContentEl && this.menuContentEl) {
                browserUtil.removeAllChildren(this.menuContentEl);
                contextDef.defaultType.actions.forEach((action) => {
                    logger('Adding action');
                    logger(action);
                    if ((selectedItem && action.hasPermission && action.hasPermission(action.actionName, contextDef.defaultType.internalType, selectedItem)) ||
                        !(action.hasPermission)) {
                        let itemEl = document.createElement(action.elementDefinition.type);
                        if (itemEl && this.menuContentEl) {
                            browserUtil.addAttributes(itemEl, action.elementDefinition.attributes);
                            browserUtil.addClasses(itemEl, action.elementDefinition.classes);
                            itemEl.setAttribute(ContextualInformationHelper.SOURCE, context.source);
                            itemEl.setAttribute(ContextualInformationHelper.TYPE, context.internalType);
                            itemEl.setAttribute(ContextualInformationHelper.DISPLAYNAME, context.displayName);
                            itemEl.setAttribute(ContextualInformationHelper.IDENTIFIER, context.identifier);
                            itemEl.setAttribute(ContextualInformationHelper.DESCRIPTION, context.description);
                            itemEl.setAttribute(EXTRA_ACTION_ATTRIBUTE_NAME, action.actionName);
                            itemEl.addEventListener('click', (event) => {
                                this.hideContextMenu(event);
                                action.handler(event);
                            });
                            itemEl.innerHTML = `${action.displayName}`;
                            if (action.iconClasses) {
                                itemEl.innerHTML += `&nbsp;&nbsp;<i class="${action.iconClasses}"></i>`;
                            }
                            this.menuContentEl.appendChild(itemEl);
                            logger('new menu element is ');
                            logger(this.menuContentEl);
                            result = true;
                        }
                    }
                });
            }
        }
        else {
            logger(`building context menu - no actions for ${context.source}`);
        }
        return result;
    }
    hideContextMenu(event) {
        if (this.menuDivEl) {
            browserUtil.addClasses(this.menuDivEl, 'd-none');
        }
    }
    showContextMenu(event) {
        if (this.menuDivEl) {
            logger(`Showing context menu at ${event.pageX},${event.pageY}`);
            browserUtil.removeClasses(this.menuDivEl, 'd-none');
            this.menuDivEl.style.left = event.pageX + 'px';
            this.menuDivEl.style.top = event.pageY + 'px';
        }
    }
}
ContextualInformationHelper.IDENTIFIER = 'context-id';
ContextualInformationHelper.SOURCE = 'context-source';
ContextualInformationHelper.TYPE = 'context-type';
ContextualInformationHelper.DISPLAYNAME = 'context-display-name';
ContextualInformationHelper.DESCRIPTION = 'title';
ContextualInformationHelper.BOOTSTRAP_TOGGLE = 'data-toggle';
ContextualInformationHelper.BOOTSTRAP_PLACEMENT = 'data-placement';
ContextualInformationHelper.BOOTSTRAP_TOOLTIP_VALUE = 'tooltip';
ContextualInformationHelper.BOOTSTRAP_POPOVER_VALUE = 'popover';
ContextualInformationHelper.BOOTSTRAP_TOGGLE_HTML = 'data-html';
ContextualInformationHelper.BOOTSTRAP_TOGGLE_HTML_VALUE = 'true';
ContextualInformationHelper.BOOTSTRAP_PLACEMENT_TOP = 'top';
ContextualInformationHelper.BOOTSTRAP_PLACEMENT_BOTTOM = 'bottom';
ContextualInformationHelper.BOOTSTRAP_PLACEMENT_RIGHT = 'right';
ContextualInformationHelper.BOOTSTRAP_PLACEMENT_LEFT = 'left';
//# sourceMappingURL=ContextualInformationHelper.js.map