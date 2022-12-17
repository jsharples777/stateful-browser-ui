import {CollectionViewRenderer} from "../interface/CollectionViewRenderer";
import debug from "debug";
import {CollectionView} from "../interface/CollectionView";
import {CollectionViewEventHandler} from "../interface/CollectionViewEventHandler";
import {TableUIConfig} from "./TableUITypeDefs";
import {ContextualInformationHelper} from "../../context/ContextualInformationHelper";
import {
    CollectionSortDirection,
    CollectionViewDOMConfig,

    EXTRA_ACTION_ATTRIBUTE_NAME, Modifier
} from "../../ConfigurationTypes";
import {BasicFieldOperations, browserUtil, DATA_ID_ATTRIBUTE, FieldType} from "browser-state-management";


const logger = debug('tabular-view-renderer-with-context');
const paginationLogger = debug('tabular-view-renderer-with-context:pagination');
const loggerEvent = debug('tabular-view-renderer-with-context-event');

export class TabularViewRendererUsingContext implements CollectionViewRenderer {
    public static SORT_DIRECTION_ATTRIBUTE:string = 'sort-direction';
    public static SORTABLE_TH_CLASS:string = 'sortable-th';
    public static NON_SORTABLE_TH_CLASS:string = 'non-sortable-th';


    protected view: CollectionView;
    protected eventHandler: CollectionViewEventHandler;
    protected tableConfig: TableUIConfig;
    protected tableBodyEl: HTMLElement | null = null;
    private stateBuffer: any[] = [];
    private containerEl?: HTMLElement;
    private collectionName?: string;
    private currentPage: number = 0;
    private observer: IntersectionObserver | null = null;
    private currentObservedTarget: HTMLElement | null = null;

    constructor(view: CollectionView, eventHandler: CollectionViewEventHandler, tableConfig: TableUIConfig) {
        this.view = view;
        this.eventHandler = eventHandler;
        this.tableConfig = tableConfig;
        this.renderNextPage = this.renderNextPage.bind(this);
    }

    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        if (this.tableBodyEl) ContextualInformationHelper.getInstance().insertDisplayElementForCollectionItem(this.view, this, this.tableBodyEl, collectionName, item, true);
    }

    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        if (this.tableBodyEl) ContextualInformationHelper.getInstance().removeDisplayElementForCollectionItem(this.view, this, this.tableBodyEl, collectionName, item);
    }

    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        if (this.tableBodyEl) ContextualInformationHelper.getInstance().updateDisplayElementForCollectionItem(this.view, this, this.tableBodyEl, collectionName, item);
    }

    public createDisplayElementForCollectionItem(collectionName: string, item: any): HTMLElement {
        const canDeleteItem: boolean = this.view.hasPermissionToDeleteItemInNamedCollection(collectionName, item);
        const uiConfig: CollectionViewDOMConfig = this.view.getCollectionUIConfig();

        logger(`view ${this.view.getName()}: creating table row item`);
        logger(item);

        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);

        let tableRowEl: HTMLElement = document.createElement(uiConfig.resultsElement.type);
        browserUtil.addClasses(tableRowEl, uiConfig.resultsElement.classes);
        browserUtil.addAttributes(tableRowEl, uiConfig.resultsElement.attributes);
        let editableFields: string[] = [];

        if (this.tableConfig.editableFields) {
            editableFields = this.tableConfig.editableFields;
        }


        // we need to build the row from the displayed item values using the renderer if present
        this.tableConfig.columns.forEach((column, index) => {
            // is the column editable?
            const foundIndex = editableFields.findIndex((editableField) => editableField === column.field.id);
            const isEditable = (foundIndex >= 0);

            const fieldValue = column.getValue(column, item[column.field.id]);
            const fieldDataType = column.field.type;


            let tdEl = document.createElement('td');
            browserUtil.addClasses(tdEl, column.elementClasses);
            browserUtil.addAttributes(tdEl, column.elementAttributes);


            if ((index + 1) === this.tableConfig.itemDetailColumn) {
                // this column is different and can have many components
                // the content may be structured
                if (uiConfig.detail.containerClasses) {
                    let contentEl: HTMLElement = document.createElement('div');
                    browserUtil.addClasses(contentEl, uiConfig.detail.containerClasses);


                    let textEl = document.createElement(uiConfig.detail.textElement.type);
                    browserUtil.addClasses(textEl, uiConfig.detail.textElement.classes);
                    browserUtil.addAttributes(textEl, uiConfig.detail.textElement.attributes);

                    // add the key ids for selection
                    this.view.renderDisplayForItemInNamedCollection(textEl, collectionName, item);

                    contentEl.appendChild(textEl);

                    if (uiConfig.detail.background) {
                        let imgEl = document.createElement(uiConfig.detail.background.type);
                        browserUtil.addClasses(imgEl, uiConfig.detail.background.classes);
                        imgEl.setAttribute('src', this.view.getBackgroundImageForItemInNamedCollection(collectionName, item));
                        contentEl.appendChild(imgEl);
                    }


                    if (uiConfig.detail.badge) {
                        const badgeValue = this.view.getBadgeValueForItemInNamedCollection(collectionName, item);
                        if (badgeValue > 0) {
                            let badgeEl: HTMLElement = document.createElement(uiConfig.detail.badge.type);
                            browserUtil.addClasses(badgeEl, uiConfig.detail.badge.classes);
                            browserUtil.addAttributes(badgeEl, uiConfig.detail.badge.attributes);
                            contentEl.appendChild(badgeEl);
                            badgeEl.innerHTML = `&nbsp;&nbsp;&nbsp;${badgeValue}&nbsp;&nbsp;&nbsp;`;
                        }
                    }

                    // add icons
                    const icons: string[] = this.view.getItemIcons(collectionName, item);
                    icons.forEach((icon) => {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, icon);
                        if (this.view.prependItemIcons(collectionName, item)) {
                            contentEl.prepend(iconEl);
                        } else {
                            contentEl.append(iconEl);
                        }
                    });


                    tdEl.appendChild(contentEl);

                }
            } else {
                switch (fieldDataType) {
                    case FieldType.colour: {
                        browserUtil.addAttributes(tdEl, [{name: "style", value: `background-color:${fieldValue}`}]);
                        tdEl.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
                        break;
                    }
                    case FieldType.boolean: {
                        let checkboxEl = <HTMLInputElement>document.createElement('input');
                        browserUtil.addAttributes(checkboxEl, [{name: 'type', value: 'checkbox'}]);
                        logger(`Field type is boolean, with value ${fieldValue}`);
                        if (fieldValue) {
                            checkboxEl.checked = true;
                        }
                        tdEl.appendChild(checkboxEl);
                        if (isEditable) {
                            checkboxEl.addEventListener('change', (event) => {
                                loggerEvent(`Checkbox with field ${column.field.id} changed to value ${checkboxEl.checked}`);
                                const fieldId = column.field.id;
                                const context = ContextualInformationHelper.getInstance().findContextFromEvent(event);
                                if (context) {
                                    this.view.setFieldValue(context.identifier, fieldId, checkboxEl.checked);
                                }
                            });
                            checkboxEl.addEventListener('click', (event) => {
                                loggerEvent(`Checkbox with field ${column.field.id} clicked to value ${checkboxEl.checked}`);
                                event.stopPropagation();
                                //event.preventDefault();
                                const fieldId = column.field.id;
                                const context = ContextualInformationHelper.getInstance().findContextFromEvent(event);
                                if (context) {
                                    this.view.setFieldValue(context.identifier, fieldId, checkboxEl.checked);
                                }
                            });
                        } else {
                            checkboxEl.disabled = true;
                        }

                        break;
                    }
                    case FieldType.text : {
                        if (isEditable) {
                            let textEl = <HTMLInputElement>document.createElement('input');
                            browserUtil.addAttributes(textEl, [{name: 'type', value: 'text'}]);
                            if (fieldValue) {
                                textEl.value = fieldValue;
                            }
                            tdEl.appendChild(textEl);
                            textEl.addEventListener('blur', (event) => {
                                loggerEvent(`field ${column.field.id} changed to value ${textEl.value}`);
                                const fieldId = column.field.id;
                                const context = ContextualInformationHelper.getInstance().findContextFromEvent(event);
                                if (context) {
                                    this.view.setFieldValue(context.identifier, fieldId, textEl.value);
                                }
                            });
                            break;
                        }
                    }
                    case FieldType.integer:
                    case FieldType.float: {
                        if (isEditable) {
                            let textEl = <HTMLInputElement>document.createElement('input');
                            browserUtil.addAttributes(textEl, [{name: 'type', value: 'number'}]);
                            if (fieldValue) {
                                textEl.value = fieldValue;
                            }
                            tdEl.appendChild(textEl);
                            textEl.addEventListener('blur', (event) => {
                                loggerEvent(`field ${column.field.id} changed to value ${textEl.value}`);
                                const fieldId = column.field.id;
                                const context = ContextualInformationHelper.getInstance().findContextFromEvent(event);
                                if (context) {
                                    if (BasicFieldOperations.getInstance().isValidValue(column.field, textEl.value)) {
                                        browserUtil.addClasses(textEl, 'is-valid');
                                        browserUtil.removeClasses(textEl, 'is-invalid');

                                        this.view.setFieldValue(context.identifier, fieldId, textEl.value);
                                    } else {
                                        browserUtil.addClasses(textEl, 'is-invalid');
                                        browserUtil.removeClasses(textEl, 'is-valid');
                                    }
                                }
                            });
                            break;
                        }
                    }
                    case FieldType.time:
                    case FieldType.shortTime:
                    case FieldType.date:
                    case FieldType.datetime:
                    case FieldType.duration: {
                        if (isEditable) {
                            let textEl = <HTMLInputElement>document.createElement('input');
                            browserUtil.addAttributes(textEl, [{name: 'type', value: 'text'}]);
                            if (fieldValue) {
                                textEl.value = fieldValue;
                            }
                            tdEl.appendChild(textEl);
                            textEl.addEventListener('blur', (event) => {
                                loggerEvent(`field ${column.field.id} changed to value ${textEl.value}`);
                                const fieldId = column.field.id;
                                const context = ContextualInformationHelper.getInstance().findContextFromEvent(event);
                                if (context) {
                                    // validate the value
                                    if (BasicFieldOperations.getInstance().isValidValue(column.field, textEl.value)) {
                                        browserUtil.addClasses(textEl, 'is-valid');
                                        browserUtil.removeClasses(textEl, 'is-invalid');

                                        this.view.setFieldValue(context.identifier, fieldId, textEl.value);
                                    } else {
                                        browserUtil.addClasses(textEl, 'is-invalid');
                                        browserUtil.removeClasses(textEl, 'is-valid');
                                    }

                                }
                            });
                            break;
                        }

                    }
                    default: {
                        if (fieldValue) {
                            tdEl.innerText = fieldValue;
                        } else {
                            tdEl.innerText = '';
                        }

                    }
                }

            }

            tableRowEl.appendChild(tdEl);
        });

        // we add an extra column for any actions or the delete function
        if (this.tableConfig.actionColumn) {
            // create the extra table column
            let tdEl = document.createElement('td');
            browserUtil.addClasses(tdEl, this.tableConfig.actionColumn.element.classes);
            browserUtil.addAttributes(tdEl, this.tableConfig.actionColumn.element.attributes);

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
                        tdEl.appendChild(action);
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
                tdEl.appendChild(deleteButtonEl);
            }

            tableRowEl.appendChild(tdEl);
        }
        if (uiConfig.detail.drag) {
            tableRowEl.setAttribute('draggable', 'true');
            tableRowEl.addEventListener('dragstart', this.eventHandler.eventStartDrag);
        }
        // add selection actions
        if (uiConfig.detail.select) {
            tableRowEl.addEventListener('click', this.eventHandler.eventClickItem);

        }

        // add modifiers for patient state
        if (uiConfig.modifiers) {
            const modifier = this.view.getModifierForItemInNamedCollection(collectionName, item);
            const secondModifier = this.view.getSecondaryModifierForItemInNamedCollection(collectionName, item);
            switch (modifier) {
                case Modifier.normal: {
                    logger(`view ${this.view.getName()}: normal item`);
                    browserUtil.addClasses(tableRowEl, uiConfig.modifiers.normal);
                    if (uiConfig.icons && uiConfig.icons.normal) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.normal);
                        //textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(tableRowEl, uiConfig.modifiers.normal);
                            browserUtil.addClasses(tableRowEl, uiConfig.modifiers.warning);
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                //textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (uiConfig.icons && uiConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.active);
                                //textEl.appendChild(iconEl);
                            }
                        }
                    }

                    break;
                }
                case Modifier.active: {
                    logger(`view ${this.view.getName()}: active item`);
                    browserUtil.removeClasses(tableRowEl, uiConfig.modifiers.normal);
                    browserUtil.addClasses(tableRowEl, uiConfig.modifiers.active);
                    if (uiConfig.icons && uiConfig.icons.active) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.active);
                        //textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            browserUtil.removeClasses(tableRowEl, uiConfig.modifiers.active);
                            browserUtil.addClasses(tableRowEl, uiConfig.modifiers.warning);
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                //textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
                case Modifier.inactive: {
                    logger(`view ${this.view.getName()}: inactive item`);
                    browserUtil.removeClasses(tableRowEl, uiConfig.modifiers.normal);
                    browserUtil.addClasses(tableRowEl, uiConfig.modifiers.inactive);
                    if (uiConfig.icons && uiConfig.icons.inactive) {
                        let iconEl = document.createElement('i');
                        browserUtil.addClasses(iconEl, uiConfig.icons.inactive);
                        //textEl.appendChild(iconEl);
                    }

                    switch (secondModifier) {
                        case Modifier.warning: {
                            if (uiConfig.icons && uiConfig.icons.warning) {
                                browserUtil.removeClasses(tableRowEl, uiConfig.modifiers.inactive);
                                browserUtil.addClasses(tableRowEl, uiConfig.modifiers.warning);
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.warning);
                                //textEl.appendChild(iconEl);
                            }
                            break;
                        }
                        case Modifier.active: {
                            if (uiConfig.icons && uiConfig.icons.active) {
                                let iconEl = document.createElement('i');
                                browserUtil.addClasses(iconEl, uiConfig.icons.active);
                                //textEl.appendChild(iconEl);
                            }
                            break;
                        }
                    }
                    break;
                }
                case Modifier.warning: {
                    browserUtil.removeClasses(tableRowEl, uiConfig.modifiers.normal);
                    browserUtil.addClasses(tableRowEl, uiConfig.modifiers.warning);
                    break;
                }

            }
        }
        return tableRowEl;
    }

    onDocumentLoaded(): void {
    }

    public setDisplayElementsForCollectionInContainer(containerEl: HTMLElement, collectionName: string, newState: any): void {
        this.currentPage = 0;
        this.stateBuffer = newState;
        this.containerEl = containerEl;
        this.collectionName = collectionName;

        this.tableBodyEl = null;
        browserUtil.removeAllChildren(containerEl);

        // create the table
        let tableEl = document.createElement(this.tableConfig.table.type);
        browserUtil.addClasses(tableEl, this.tableConfig.table.classes);
        browserUtil.addAttributes(tableEl, this.tableConfig.table.attributes);

        // create the headers
        let tableHeaderEl = document.createElement(this.tableConfig.header.type);
        browserUtil.addClasses(tableHeaderEl, this.tableConfig.header.classes);
        browserUtil.addAttributes(tableHeaderEl, this.tableConfig.header.attributes);


        // create the column headers
        this.tableConfig.headerColumns.forEach((header) => {
            let thEl = document.createElement(header.element.type);
            browserUtil.addClasses(thEl, header.element.classes);
            browserUtil.addAttributes(thEl, header.element.attributes);
            if (header.element.innerHTML) thEl.innerHTML = header.element.innerHTML;
            if (this.tableConfig.sortableTableHeaders) {
                    if (header.field) {
                        const headerFieldId = header.field.id;
                        if (this.tableConfig.sortableTableHeaders.findIndex((fieldId) => fieldId === headerFieldId) >= 0) {
                            browserUtil.addClasses(thEl,TabularViewRendererUsingContext.SORTABLE_TH_CLASS);
                            browserUtil.addAttribute(thEl, {name:DATA_ID_ATTRIBUTE,value:header.field.id})
                            browserUtil.addAttribute(thEl, {name:TabularViewRendererUsingContext.SORT_DIRECTION_ATTRIBUTE,value:''+header.sortDirection})
                            thEl.addEventListener('click',(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                // get the current sort direction
                                const currentSortDirectionString = thEl.getAttribute(TabularViewRendererUsingContext.SORT_DIRECTION_ATTRIBUTE);
                                const fieldId = thEl.getAttribute(DATA_ID_ATTRIBUTE);
                                if (currentSortDirectionString && fieldId) {
                                    const currentSortDirection = parseInt(currentSortDirectionString);
                                    let newSortDirection = CollectionSortDirection.descending;

                                    switch (currentSortDirection) {
                                        case CollectionSortDirection.ascending: {
                                            newSortDirection = CollectionSortDirection.descending;
                                            break;
                                        }
                                        case CollectionSortDirection.descending: {
                                            newSortDirection = CollectionSortDirection.ascending;
                                            break;
                                        }
                                    }
                                    header.sortDirection = newSortDirection;
                                    this.view.applySorter({majorDirection: newSortDirection, majorFieldId: fieldId});
                                }
                            });

                        }
                        else {
                            browserUtil.addClasses(thEl,TabularViewRendererUsingContext.NON_SORTABLE_TH_CLASS);
                        }
                    }
                    else {
                        browserUtil.addClasses(thEl,TabularViewRendererUsingContext.NON_SORTABLE_TH_CLASS);
                    }
            }
            else {
                browserUtil.addClasses(thEl,TabularViewRendererUsingContext.NON_SORTABLE_TH_CLASS);
            }
            tableHeaderEl.appendChild(thEl);
        });

        // create the action column header (if one)
        if (this.tableConfig.actionColumn) {
            let thEl = document.createElement(this.tableConfig.actionColumn.element.type);
            browserUtil.addClasses(thEl, this.tableConfig.actionColumn.element.classes);
            browserUtil.addAttributes(thEl, this.tableConfig.actionColumn.element.attributes);
            browserUtil.addClasses(thEl,TabularViewRendererUsingContext.NON_SORTABLE_TH_CLASS);
            if (this.tableConfig.actionColumn.element.innerHTML) thEl.innerHTML = this.tableConfig.actionColumn.element.innerHTML;
            tableHeaderEl.appendChild(thEl);
        }
        tableEl.appendChild(tableHeaderEl);


        // create the table body
        this.tableBodyEl = document.createElement(this.tableConfig.body.type);
        browserUtil.addClasses(this.tableBodyEl, this.tableConfig.body.classes);
        browserUtil.addAttributes(this.tableBodyEl, this.tableConfig.body.attributes);

        this.setDisplayElementsForCollectionInContainerForNextPage(containerEl, collectionName, newState);
        tableEl.appendChild(this.tableBodyEl);
        containerEl.appendChild(tableEl);
    }

    public setDisplayElementsForCollectionInContainerForNextPage(containerEl: HTMLElement, collectionName: string, newState: any): void {
        paginationLogger(`view ${this.view.getName()}: creating Results`);
        logger(newState);
        this.currentPage++;

        let isLazyLoading: boolean = false;
        let itemPageSize = this.stateBuffer.length;

        if (this.tableConfig && this.tableConfig.lazyLoadPageSize) {
            itemPageSize = this.tableConfig.lazyLoadPageSize;
            isLazyLoading = true;
        } else {
            if (itemPageSize > 50) {
                this.tableConfig.lazyLoadPageSize = 50;
                itemPageSize = 50;
                isLazyLoading = true;
            }
        }
        // remove the previous items from list
        if (this.currentPage === 1) {
            if (this.tableBodyEl) browserUtil.removeAllChildren(this.tableBodyEl);
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
            if (this.tableBodyEl) lastChildEl = ContextualInformationHelper.getInstance().insertDisplayElementForCollectionItem(this.view, this, this.tableBodyEl, collectionName, item);
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

    protected renderNextPage(entries: any): void {
        if (entries[0].intersectionRatio <= 0) return;

        paginationLogger('rendering next page');
        if (this.observer && this.currentObservedTarget) {
            paginationLogger('unobserving current target');
            paginationLogger(this.currentObservedTarget);
            this.observer.unobserve(this.currentObservedTarget);
            this.currentObservedTarget = null;
        }
        if (this.containerEl && this.collectionName) {
            this.setDisplayElementsForCollectionInContainerForNextPage(this.containerEl, this.collectionName, this.stateBuffer);
        }
    }

}
