import { View } from "../view/interface/View";
import { CollectionView } from "../view/interface/CollectionView";
import { CollectionViewRenderer } from "../view/interface/CollectionViewRenderer";
import { BasicElement } from "../CommonTypes";
export declare type getIdentifier = (type: string, item: any) => string;
export declare type getDescription = (type: string, item: any) => string;
export declare type actionHandler = (event: MouseEvent) => void;
export declare type hasActionPermission = (actionName: string, type: string, item: any) => boolean;
export declare type ContextTypeAction = {
    actionName: string;
    displayName: string;
    elementDefinition: BasicElement;
    iconClasses?: string;
    handler: actionHandler;
    hasPermission?: hasActionPermission;
};
export declare type ContextDefinitionType = {
    internalType: string;
    displayName: string;
    identifier: getIdentifier;
    description: getDescription;
    actions: ContextTypeAction[];
};
export declare type ContextDefinition = {
    source: string;
    view?: View;
    defaultType: ContextDefinitionType;
    extraTypes?: ContextDefinitionType[];
};
export declare type ContextDetails = {
    source: string;
    internalType: string;
    displayName: string;
    identifier: string;
    description: string;
};
export declare enum TogglePlacement {
    top = 0,
    bottom = 1,
    right = 2,
    left = 3
}
export declare class ContextualInformationHelper {
    static IDENTIFIER: string;
    private static _instance;
    private static SOURCE;
    private static TYPE;
    private static DISPLAYNAME;
    private static DESCRIPTION;
    private static BOOTSTRAP_TOGGLE;
    private static BOOTSTRAP_PLACEMENT;
    private static BOOTSTRAP_TOOLTIP_VALUE;
    private static BOOTSTRAP_POPOVER_VALUE;
    private static BOOTSTRAP_TOGGLE_HTML;
    private static BOOTSTRAP_TOGGLE_HTML_VALUE;
    private static BOOTSTRAP_PLACEMENT_TOP;
    private static BOOTSTRAP_PLACEMENT_BOTTOM;
    private static BOOTSTRAP_PLACEMENT_RIGHT;
    private static BOOTSTRAP_PLACEMENT_LEFT;
    private registry;
    private menuDivEl;
    private menuContentEl;
    private constructor();
    static getInstance(): ContextualInformationHelper;
    onDocumentLoaded(): void;
    addContextFromView(view: View, internalType: string, displayName: string): ContextDefinition;
    addContextToElement(source: string, type: string, item: any, element: HTMLElement, addTooltip?: boolean, placement?: TogglePlacement): void;
    findContextFromEvent(event: Event): ContextDetails | null;
    addActionToContext(context: ContextDefinition, actionName: string, displayName: string, handler: actionHandler, icon?: string, permissionCheck?: hasActionPermission): void;
    handleContextMenu(event: MouseEvent): any;
    insertDisplayElementForCollectionItem(view: CollectionView, renderer: CollectionViewRenderer, containerEl: HTMLElement, collectionName: string, item: any, prepend?: boolean): HTMLElement;
    removeDisplayElementForCollectionItem(view: CollectionView, renderer: CollectionViewRenderer, containerEl: HTMLElement, collectionName: string, item: any): void;
    updateDisplayElementForCollectionItem(view: CollectionView, renderer: CollectionViewRenderer, containerEl: HTMLElement, collectionName: string, item: any): void;
    private ensureInRegistry;
    private findContextFromElement;
    private findAllContextsFromElement;
    private addContextActionToContext;
    private buildContextMenu;
    private hideContextMenu;
    private showContextMenu;
}
