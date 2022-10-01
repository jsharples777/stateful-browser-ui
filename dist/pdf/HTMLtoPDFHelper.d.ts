import { jsPDF } from "jspdf";
declare type PDFInfo = {
    lineSpacingInMM: number;
    maxCharactersPerLineOfText: number;
    cumulativeContentHeight: number;
    pageCount: number;
    currentIndent: number;
    indentLevel: number;
    fontStack: FontStackItem[];
    listStack: ListStackItem[];
};
declare type FontStackItem = {
    element: HTMLElement | null;
    fontName: string;
    fontSize: number;
    fontStyle: string;
};
declare type ListStackItem = {
    element: HTMLElement;
    isNumbered: boolean;
    itemCount: number;
};
export declare class HTMLtoPDFHelper {
    static MM_PER_FONT_POINT: number;
    static TOP_MARGIN: number;
    static LEFT_MARGIN: number;
    static BOTTOM_MARGIN: number;
    static RIGHT_MARGIN: number;
    static DEFAULT_INDENT: number;
    static DEFAULT_LIST_ITEM_INDENT: number;
    static DEFAULT_FONT: string;
    static CODE_ELEMENT_FONT: string;
    static DEFAULT_FONT_SIZE: number;
    static DEFAULT_LINE_SPACING: number;
    private static a4Dimensions;
    private static H1_FONT_SIZE_CHANGE;
    private static H2_FONT_SIZE_CHANGE;
    private static H3_FONT_SIZE_CHANGE;
    private static H4_FONT_SIZE_CHANGE;
    private static H5_FONT_SIZE_CHANGE;
    private static H6_FONT_SIZE_CHANGE;
    private static _instance;
    private constructor();
    static getInstance(): HTMLtoPDFHelper;
    static wrapLine(line: string, maxCharacterLength: number): string[];
    protected computeElementHeight(element: HTMLElement, pdfInfo: PDFInfo, addExtraSpace: boolean): number;
    protected addElementToPDF(element: HTMLElement, pdf: jsPDF, pdfInfo: PDFInfo, addExtraSpace: boolean): void;
    protected postAddElementToPDF(element: HTMLElement, pdf: jsPDF, pdfInfo: PDFInfo): void;
    protected preAddElementToPDF(element: HTMLElement, pdf: jsPDF, pdfInfo: PDFInfo): void;
    protected convertElementToPDF(parentElement: HTMLElement | null, element: HTMLElement, pdf: jsPDF, pdfInfo: PDFInfo, addExtraSpace: boolean): void;
    convertHTMLtoPDF(htmlContainerId: string, addExtraSpace: boolean): {
        pdf: jsPDF;
        pdfInfo: PDFInfo;
    };
}
export {};
