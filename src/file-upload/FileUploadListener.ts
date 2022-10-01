export enum FileUploadType {
    cancelled,
    uploaded
}

export type FileUploadEvent = {
    outcome: FileUploadType,
    result?: any,
    context?: any
}

export type FileUploadConfig = {
    url: string,
    title: string,
    listener: FileUploadListener,
    context: any,
    additionalParametersFromContent: string[]
}

export interface FileUploadListener {
    fileUploadCompleted(event: FileUploadEvent): void;
}
