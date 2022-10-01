import { jsPDF } from 'jspdf';
export declare type PDFConfigElement = {
    x: number;
    y: number;
    w?: number;
    h?: number;
    font?: string;
    fontStyle?: string;
    fontSize?: number;
    text: string;
    image?: {
        fileName: string;
        format: string;
    };
    imageBase64?: string;
    fillColour?: number;
};
export declare type PDFConfigPage = {
    pageElements: PDFConfigElement[];
    backgroundImage?: {
        fileName: string;
        format: string;
    };
};
export declare type PDFConfig = {
    fileName: string;
    defaultFont?: string;
    defaultFontSize?: number;
    pages: PDFConfigPage[];
};
export declare class PDFHelper {
    static DEFAULT_FONT_SIZE: number;
    static DEFAULT_FONT: string;
    private static _instance;
    private graphicsStateSaved;
    private constructor();
    static getInstance(): PDFHelper;
    static wrapLine(line: string, maxLength: number): string;
    static wrapText(lines: string[], maxLength: number): string;
    static convertApplicationPDFConfigAndContextToPDFConfig(fileName: string, pdfConfig: any, context: any, horizontalOffset: number, verticalOffset: number): PDFConfig;
    removeBackgroundFromPDFConfig(config: PDFConfig): void;
    createPDF(config: PDFConfig): {
        document: jsPDF;
        hadBackgroundInPages: boolean;
    };
    printPDF(config: PDFConfig, printToWindow?: boolean, printToFile?: boolean, printBothWithAndWithoutBackground?: boolean): void;
    protected populatePage(document: jsPDF, page: PDFConfigPage): void;
}
