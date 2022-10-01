export declare enum FileUploadType {
    cancelled = 0,
    uploaded = 1
}
export declare type FileUploadEvent = {
    outcome: FileUploadType;
    result?: any;
    context?: any;
};
export declare type FileUploadConfig = {
    url: string;
    title: string;
    listener: FileUploadListener;
    context: any;
    additionalParametersFromContent: string[];
};
export interface FileUploadListener {
    fileUploadCompleted(event: FileUploadEvent): void;
}
