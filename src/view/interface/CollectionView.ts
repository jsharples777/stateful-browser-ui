import {View} from "./View";
import {CollectionViewDOMConfig, CollectionSortConfig, Modifier} from "../../ConfigurationTypes";
import {CollectionFilter} from "browser-state-management";


export interface CollectionView extends View {
    getIdForItemInNamedCollection(name: string, item: any): string;

    getItemInNamedCollection(name: string, item: any): any;

    getCollectionName(): string;

    renderDisplayForItemInNamedCollection(containerEl: HTMLElement, name: string, item: any): void;

    compareItemsForEquality(item1: any, item2: any): boolean;

    getModifierForItemInNamedCollection(name: string, item: any): Modifier;

    getSecondaryModifierForItemInNamedCollection(name: string, item: any): Modifier;

    getBadgeValueForItemInNamedCollection(name: string, item: any): number;

    getSecondaryBadgeValueForItemInNamedCollection(name: string, item: any): number;

    getTertiaryBadgeValueForItemInNamedCollection(name: string, item: any): number;

    getBackgroundImageForItemInNamedCollection(name: string, item: any): string;

    renderBackgroundForItemInNamedCollection(containerEl: HTMLElement, name: string, item: any): void;

    hasPermissionToDeleteItemInNamedCollection(name: string, item: any): boolean;

    hasPermissionToUpdateItemInNamedCollection(name: string, item: any): boolean;

    hasPermissionForActionOnItemInNamedCollection(actionName: string, name: string, item: any): boolean;

    updateViewForNamedCollection(name: string, collection: any): void;

    getCollectionUIConfig(): CollectionViewDOMConfig;

    applyDefaultSort(item1: any, item2: any): number;

    getItemIcons(name: string, item: any): string[];

    prependItemIcons(name: string, item: any): boolean;

    applyFilter(filter: CollectionFilter): void;

    hasFilter(): boolean;

    clearFilter(): void;

    setOnlyDisplayWithFilter(onlyDisplayWithFilter: boolean): void;

    getCurrentFilter(): CollectionFilter | null;


    applySorter(sorter: CollectionSortConfig): void;

    hasSorter(): boolean;

    clearSorter(): void;

    getDisplayedCollection(): any[];

    setFieldValue(objectId: string, fieldId: string, value: any): void;


}
