import debug from 'debug';
import {FileUploadConfig, FileUploadType} from "./FileUploadListener";

import {
    KeyActionEvent,
    KeyActionEventReceiver,
    KeyActionReceiverConfig
} from "../key-binding-manager/KeyActionEventReceiver";
import {KeyBindingManager} from "../key-binding-manager/KeyBindingManager";
import {ApiUtil, SecurityManager, SimpleRequest} from "browser-state-management";
import {BasicKeyAction} from "../CommonTypes";

const DEFAULT_FILE_UPLOAD_MODAL_ID = 'file-upload';
const DEFAULT_FILE_UPLOAD_FORM_ID = 'file-upload-form';
const DEFAULT_FILE_UPLOAD_TITLE = 'file-upload-title';
const DEFAULT_FILE_UPLOAD_CLOSE = 'file-upload-close';
const DEFAULT_FILE_UPLOAD_CANCEL = 'file-upload-cancel';
const DEFAULT_FILE_UPLOAD_UPLOAD = 'file-upload-upload';

const FILE_UPLOAD_hideClass = "d-none";
const FILE_UPLOAD_showClass = "d-block";

const logger = debug('file-upload');

export type FileUploadManagerConfig = {
    modalDivId: string,
    titleId: string,
    cancelButtonId: string,
    uploadButtonId: string,
    formId: string,
    closeButtonId: string,
}

export class FileUploadManager implements KeyActionEventReceiver {
    private static _instance: FileUploadManager;
    private fileUploadDiv: HTMLDivElement;
    private fileUploadTitle: HTMLHeadingElement;
    private cancelButton: HTMLButtonElement;
    private uploadButton: HTMLButtonElement;
    private fileUploadForm: HTMLFormElement;
    // @ts-ignore
    private config: FileUploadConfig;
    private closeButton: HTMLButtonElement;

    public constructor(config: FileUploadManagerConfig) {
        this.fileUploadDiv = <HTMLDivElement>document.getElementById(config.modalDivId);
        this.fileUploadTitle = <HTMLHeadingElement>document.getElementById(config.titleId);
        this.cancelButton = <HTMLButtonElement>document.getElementById(config.cancelButtonId);
        this.closeButton = <HTMLButtonElement>document.getElementById(config.closeButtonId);
        this.uploadButton = <HTMLButtonElement>document.getElementById(config.uploadButtonId);
        this.fileUploadForm = <HTMLFormElement>document.getElementById(config.formId);

        this.startUpload = this.startUpload.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);
        this.cancelHandler = this.cancelHandler.bind(this);
        this.keyActionEvent = this.keyActionEvent.bind(this);

        this.fileUploadForm.addEventListener('submit', this.confirmHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
        this.closeButton.addEventListener('click', this.cancelHandler);

        const keyBindingConfig: KeyActionReceiverConfig = {
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
        }
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);
    }

    public static getInstance(): FileUploadManager {
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

    keyActionEvent(event: KeyActionEvent): void {
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

    public startUpload(config: FileUploadConfig) {
        this.fileUploadTitle.innerHTML = config.title;
        this.config = config;
        this.fileUploadForm.reset();
        this.show();
    }

    protected hide() {
        this.fileUploadDiv.classList.add(FILE_UPLOAD_hideClass);
        this.fileUploadDiv.classList.remove(FILE_UPLOAD_showClass);
        KeyBindingManager.getInstance().deactivateContext('File Upload');
    }

    protected show() {
        this.fileUploadDiv.classList.remove(FILE_UPLOAD_hideClass);
        this.fileUploadDiv.classList.add(FILE_UPLOAD_showClass);
        KeyBindingManager.getInstance().activateContext('File Upload');
    }

    protected cancelHandler(event: MouseEvent | null) {
        logger(`Handling cancel event from file upload`);
        this.hide();
        this.config.listener.fileUploadCompleted({outcome: FileUploadType.cancelled, result: this.config.context});
    }

    protected confirmHandler(event: Event | null) {
        if (event) event.preventDefault();
        logger(`Handling submit event from file upload`);


        const callbackHandler = (data: any, status: number, context?: any) => {
            this.config.listener.fileUploadCompleted({
                outcome: FileUploadType.uploaded,
                result: data,
                context: context
            });
        }
        // @ts-ignore
        let body = new FormData(event.target);

        this.config.additionalParametersFromContent.forEach((name: string) => {
            const contextValue: any = this.config.context[name];
            if (contextValue) {
                body.append(name, contextValue);
            }
        });


        let request: SimpleRequest = {
            url: this.config.url,
            body: body,
            callback: callbackHandler,
            context: this.config.context
        }

        if (SecurityManager.getInstance().callsRequireToken()) {
            request.jwt = SecurityManager.getInstance().getToken();
        }

        ApiUtil.getInstance().simplePOSTFormData(request);
        this.hide();
    }
}
