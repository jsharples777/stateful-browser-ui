import debug from 'debug';
import { ViewLinkerStateChangedListener } from "./ViewLinkerStateChangedListener";
import { BasicObjectDefinitionFactory, ObjectDefinitionRegistry, UndefinedBoolean } from "browser-state-management";
import { FormDetailViewRenderer } from "../view/renderer/FormDetailViewRenderer";
import { BootstrapFormConfigHelper } from "../helper/BootstrapFormConfigHelper";
import { DetailViewImplementation } from "../view/implementation/DetailViewImplementation";
import { DefaultFieldPermissionChecker } from "../view/item/DefaultFieldPermissionChecker";
import { LinkedCollectionDetailController } from "../helper/LinkedCollectionDetailController";
import { ElementLocation } from "../CommonTypes";
const logger = debug('view-linker-helper');
export class ViewLinkerHelper {
    constructor() {
    }
    static getInstance() {
        if (!(ViewLinkerHelper._instance)) {
            ViewLinkerHelper._instance = new ViewLinkerHelper();
        }
        return ViewLinkerHelper._instance;
    }
    onDocumentLoaded(config) {
        let form = null;
        let result = {};
        if (config.sidebar) {
            config.sidebar.addView(config.listView, { containerId: config.listContainerId });
        }
        else {
            const el = document.getElementById(config.listContainerId);
            if (el)
                config.listView.setContainedBy(el);
        }
        const def = ObjectDefinitionRegistry.getInstance().findDefinition(config.dataObjectName);
        if (def) {
            result.dataObjDef = def;
            if (!(config.fieldPermissionChecker)) {
                config.fieldPermissionChecker = new DefaultFieldPermissionChecker();
            }
            if (!(config.formConfigHelper)) {
                config.formConfigHelper = BootstrapFormConfigHelper.getInstance();
            }
            let hasExternalControl = (config.hasExternalControl && (config.hasExternalControl === UndefinedBoolean.true));
            // @ts-ignore
            const detailRenderer = new FormDetailViewRenderer(config.detailContainerId, def, config.fieldPermissionChecker, config.formConfigHelper, hasExternalControl);
            const detailView = new DetailViewImplementation({
                resultsContainerId: config.detailContainerId,
                dataSourceId: config.detailViewName
            }, detailRenderer);
            const viewLinker = new LinkedCollectionDetailController(config.dataObjectName, config.listView);
            viewLinker.addLinkedDetailView(detailView);
            result.linker = viewLinker;
            result.detailView = detailView;
            result.listView = config.listView;
            if (config.sidebar) {
                config.sidebar.onDocumentLoaded();
            }
            else {
                config.listView.onDocumentLoaded();
            }
            if (!(config.runtimeConfig)) {
                const startingDisplayOrder = BasicObjectDefinitionFactory.getInstance().generateStartingDisplayOrder(def);
                let runtimeConfig = {
                    fieldDisplayOrders: startingDisplayOrder,
                    hideModifierFields: UndefinedBoolean.true,
                    hasExternalControl: UndefinedBoolean.false,
                    deleteButton: {
                        classes: 'btn-warning rounded p-1 mr-2 mt-2 w-100',
                        iconClasses: 'fas fa-trash-alt'
                    },
                    cancelButton: {
                        classes: 'btn-info rounded p-1 mr-2 mt-2 w-100',
                        iconClasses: 'fas fa-ban'
                    },
                    saveButton: {
                        classes: 'btn-primary rounded p-1 mr-2 mt-2 w-100',
                        iconClasses: 'fas fa-save'
                    },
                    buttonLocation: ElementLocation.bottom,
                    autoscrollOnNewContent: UndefinedBoolean.true,
                    autoSave: UndefinedBoolean.false
                };
                config.runtimeConfig = runtimeConfig;
            }
            config.runtimeConfig.autoscrollOnNewContent = UndefinedBoolean.false;
            if (config.autoscrollOnNewContent) {
                config.runtimeConfig.autoscrollOnNewContent = config.autoscrollOnNewContent;
            }
            config.runtimeConfig.autoSave = UndefinedBoolean.false;
            if (config.autoSave) {
                config.runtimeConfig.autoSave = config.autoSave;
            }
            detailView.initialise(config.runtimeConfig);
            form = detailRenderer.getForm();
            if (form) {
                result.form = form;
                new ViewLinkerStateChangedListener(config.stateManager, config.dataObjectName, result.form);
                if (config.formListener) {
                    form.addListener(config.formListener);
                }
                // setup the event handling for the create new button
                if (config.createButtonId) {
                    const create = document.getElementById(config.createButtonId);
                    logger(`Setting up button for creating ${config.dataObjectName}`);
                    if (create) {
                        create.addEventListener('click', (event) => {
                            logger(`Asking view linker to start a new object`);
                            viewLinker.startNewObject(null);
                            if (config.autoSaveOnCreateNew) {
                                // @ts-ignore
                                form.save();
                            }
                        });
                    }
                    else {
                        throw new Error(`${config.createButtonId} not found`);
                    }
                }
            }
            if (config.dataObjectListener)
                viewLinker.addListener(config.dataObjectListener);
        }
        return result;
    }
}
//# sourceMappingURL=ViewLinkerHelper.js.map