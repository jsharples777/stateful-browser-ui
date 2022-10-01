import debug from 'debug';
import { FileUploadType } from "./FileUploadListener";
import { KeyBindingManager } from "../key-binding-manager/KeyBindingManager";
import { ApiUtil, SecurityManager } from "browser-state-management";
import { BasicKeyAction } from "../CommonTypes";
const DEFAULT_FILE_UPLOAD_MODAL_ID = 'file-upload';
const DEFAULT_FILE_UPLOAD_FORM_ID = 'file-upload-form';
const DEFAULT_FILE_UPLOAD_TITLE = 'file-upload-title';
const DEFAULT_FILE_UPLOAD_CLOSE = 'file-upload-close';
const DEFAULT_FILE_UPLOAD_CANCEL = 'file-upload-cancel';
const DEFAULT_FILE_UPLOAD_UPLOAD = 'file-upload-upload';
const FILE_UPLOAD_hideClass = "d-none";
const FILE_UPLOAD_showClass = "d-block";
const logger = debug('file-upload');
export class FileUploadManager {
    constructor(config) {
        this.fileUploadDiv = document.getElementById(config.modalDivId);
        this.fileUploadTitle = document.getElementById(config.titleId);
        this.cancelButton = document.getElementById(config.cancelButtonId);
        this.closeButton = document.getElementById(config.closeButtonId);
        this.uploadButton = document.getElementById(config.uploadButtonId);
        this.fileUploadForm = document.getElementById(config.formId);
        this.startUpload = this.startUpload.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);
        this.cancelHandler = this.cancelHandler.bind(this);
        this.keyActionEvent = this.keyActionEvent.bind(this);
        this.fileUploadForm.addEventListener('submit', this.confirmHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
        this.closeButton.addEventListener('click', this.cancelHandler);
        const keyBindingConfig = {
            contextName: 'File Upload',
            receiver: this,
            keyBindings: [
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Enter',
                    actionName: BasicKeyAction.ok
                },
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Escape',
                    actionName: BasicKeyAction.cancel
                }
            ]
        };
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);
    }
    static getInstance() {
        if (!(FileUploadManager._instance)) {
            FileUploadManager._instance = new FileUploadManager({
                modalDivId: DEFAULT_FILE_UPLOAD_MODAL_ID,
                titleId: DEFAULT_FILE_UPLOAD_TITLE,
                cancelButtonId: DEFAULT_FILE_UPLOAD_CANCEL,
                uploadButtonId: DEFAULT_FILE_UPLOAD_UPLOAD,
                formId: DEFAULT_FILE_UPLOAD_FORM_ID,
                closeButtonId: DEFAULT_FILE_UPLOAD_CLOSE
            });
        }
        return FileUploadManager._instance;
    }
    keyActionEvent(event) {
        switch (event.actionName) {
            case BasicKeyAction.ok: {
                this.confirmHandler(null);
                break;
            }
            case BasicKeyAction.cancel: {
                this.cancelHandler(null);
                break;
            }
        }
    }
    startUpload(config) {
        this.fileUploadTitle.innerHTML = config.title;
        this.config = config;
        this.show();
    }
    hide() {
        this.fileUploadDiv.classList.add(FILE_UPLOAD_hideClass);
        this.fileUploadDiv.classList.remove(FILE_UPLOAD_showClass);
        KeyBindingManager.getInstance().deactivateContext('File Upload');
    }
    show() {
        this.fileUploadDiv.classList.remove(FILE_UPLOAD_hideClass);
        this.fileUploadDiv.classList.add(FILE_UPLOAD_showClass);
        KeyBindingManager.getInstance().activateContext('File Upload');
    }
    cancelHandler(event) {
        logger(`Handling cancel event from file upload`);
        this.hide();
        this.config.listener.fileUploadCompleted({ outcome: FileUploadType.cancelled, result: this.config.context });
    }
    confirmHandler(event) {
        if (event)
            event.preventDefault();
        logger(`Handling submit event from file upload`);
        const callbackHandler = (data, status, context) => {
            this.config.listener.fileUploadCompleted({
                outcome: FileUploadType.uploaded,
                result: data,
                context: context
            });
        };
        // @ts-ignore
        let body = new FormData(event.target);
        this.config.additionalParametersFromContent.forEach((name) => {
            const contextValue = this.config.context[name];
            if (contextValue) {
                body.append(name, contextValue);
            }
        });
        let request = {
            url: this.config.url,
            body: body,
            callback: callbackHandler,
            context: this.config.context
        };
        if (SecurityManager.getInstance().callsRequireToken()) {
            request.jwt = SecurityManager.getInstance().getToken();
        }
        ApiUtil.getInstance().simplePOSTFormData(request);
        this.hide();
    }
}
//# sourceMappingURL=FileUploadManager.js.map