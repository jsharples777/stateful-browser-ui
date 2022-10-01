import { FileUploadConfig } from "./FileUploadListener";
import { KeyActionEvent, KeyActionEventReceiver } from "../key-binding-manager/KeyActionEventReceiver";
export declare type FileUploadManagerConfig = {
    modalDivId: string;
    titleId: string;
    cancelButtonId: string;
    uploadButtonId: string;
    formId: string;
    closeButtonId: string;
};
export declare class FileUploadManager implements KeyActionEventReceiver {
    private static _instance;
    private fileUploadDiv;
    private fileUploadTitle;
    private cancelButton;
    private uploadButton;
    private fileUploadForm;
    private config;
    private closeButton;
    constructor(config: FileUploadManagerConfig);
    static getInstance(): FileUploadManager;
    keyActionEvent(event: KeyActionEvent): void;
    startUpload(config: FileUploadConfig): void;
    protected hide(): void;
    protected show(): void;
    protected cancelHandler(event: MouseEvent | null): void;
    protected confirmHandler(event: Event | null): void;
}
