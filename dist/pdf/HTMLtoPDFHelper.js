import { jsPDF } from "jspdf";
export class HTMLtoPDFHelper {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }
    static getInstance() {
        if (!(HTMLtoPDFHelper._instance)) {
            HTMLtoPDFHelper._instance = new HTMLtoPDFHelper();
        }
        return HTMLtoPDFHelper._instance;
    }
    static wrapLine(line, maxCharacterLength) {
        let lines = [];
        if (line.length > maxCharacterLength) {
            let newLine = '';
            // try to find the space closest to the end
            const lineComponents = line.split(' ');
            let done = false;
            let index = 0;
            while ((index <= lineComponents.length) && (!done)) {
                if ((newLine.length + lineComponents[index].length + 1) < maxCharacterLength) {
                    newLine += `${lineComponents[index]} `;
                    index++;
                }
                else {
                    // line components too long
                    done = true;
                    // wrap the remainder of the line
                    let lineRemainder = [];
                    for (let index2 = index; index2 < lineComponents.length; index2++) {
                        lineRemainder.push(lineComponents[index2]);
                    }
                    const restOfLine = lineRemainder.join(' ');
                    lines.push(newLine + '');
                    const additionalLines = HTMLtoPDFHelper.wrapLine(restOfLine, maxCharacterLength);
                    additionalLines.forEach((additionalLine) => {
                        lines.push(additionalLine);
                    });
                }
            }
        }
        else {
            lines.push(line);
        }
        return lines;
    }
    computeElementHeight(element, pdfInfo, addExtraSpace) {
        let height = 0;
        switch (element.nodeName) {
            case 'H1': {
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H1_FONT_SIZE_CHANGE);
                break;
            }
            case 'H2': {
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H2_FONT_SIZE_CHANGE);
                break;
            }
            case 'H3': {
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H3_FONT_SIZE_CHANGE);
                break;
            }
            case 'H4': {
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H4_FONT_SIZE_CHANGE);
                break;
            }
            case 'H5': {
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H5_FONT_SIZE_CHANGE);
                break;
            }
            case 'H6': {
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H6_FONT_SIZE_CHANGE);
                break;
            }
            case '#text': {
                const currentFontStackItem = pdfInfo.fontStack[0];
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontStackItem.fontSize;
                const text = element.nodeValue;
                const isInListItem = (pdfInfo.listStack.length > 0);
                if (text) {
                    if (text.length >= pdfInfo.maxCharactersPerLineOfText) {
                        const lines = HTMLtoPDFHelper.wrapLine(text, pdfInfo.maxCharactersPerLineOfText);
                        if (isInListItem) {
                            height = height * (lines.length - 1);
                        }
                        else {
                            height = height * lines.length;
                        }
                    }
                    else {
                        if (isInListItem)
                            height = 0;
                    }
                }
                else {
                    height = 0;
                }
                break;
            }
            case 'HR': {
                height = 1;
                break;
            }
            case 'BR': {
                const currentFontStackItem = pdfInfo.fontStack[0];
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontStackItem.fontSize * 0.5;
                break;
            }
            case 'P': {
                if (addExtraSpace) {
                    const currentFontStackItem = pdfInfo.fontStack[0];
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontStackItem.fontSize * 0.6;
                }
                break;
            }
            default: {
                break;
            }
        }
        return height;
    }
    addElementToPDF(element, pdf, pdfInfo, addExtraSpace) {
        switch (element.nodeName) {
            case 'OL':
            case 'UL': {
                pdfInfo.currentIndent += HTMLtoPDFHelper.DEFAULT_INDENT;
                pdfInfo.indentLevel++;
                break;
            }
            case 'LI': {
                const listStackItem = pdfInfo.listStack[0];
                const currentFontSize = pdf.getFontSize();
                const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize;
                pdfInfo.cumulativeContentHeight += height;
                if (listStackItem.isNumbered) {
                    pdf.text(`${listStackItem.itemCount}.`, pdfInfo.currentIndent, pdfInfo.cumulativeContentHeight);
                }
                else {
                    pdf.text('\u2022', pdfInfo.currentIndent, pdfInfo.cumulativeContentHeight);
                }
                pdfInfo.currentIndent += HTMLtoPDFHelper.DEFAULT_LIST_ITEM_INDENT;
                break;
            }
            case 'BR': {
                const currentFontSize = pdf.getFontSize();
                const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize * 0.5;
                pdfInfo.cumulativeContentHeight += height;
                break;
            }
            case 'P': {
                if (addExtraSpace) {
                    const currentFontSize = pdf.getFontSize();
                    const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize * 0.6;
                    pdfInfo.cumulativeContentHeight += height;
                }
                break;
            }
            case '#text': {
                const currentFontSize = pdf.getFontSize();
                const text = element.nodeValue;
                const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize;
                const isInListItem = (pdfInfo.listStack.length > 0);
                if (text) {
                    if (text.length >= pdfInfo.maxCharactersPerLineOfText) {
                        const lines = HTMLtoPDFHelper.wrapLine(text, pdfInfo.maxCharactersPerLineOfText);
                        lines.forEach((line, index) => {
                            if ((index === 0) && (isInListItem)) {
                            }
                            else {
                                pdfInfo.cumulativeContentHeight += height;
                            }
                            pdf.text(line, pdfInfo.currentIndent, pdfInfo.cumulativeContentHeight);
                        });
                    }
                    else {
                        if (!isInListItem)
                            pdfInfo.cumulativeContentHeight += height;
                        pdf.text(text, pdfInfo.currentIndent, pdfInfo.cumulativeContentHeight);
                    }
                }
                break;
            }
            case 'HR': {
                pdfInfo.cumulativeContentHeight += 3;
                pdf.saveGraphicsState();
                // this.graphicsStateSaved = true;
                pdf.setDrawColor(0);
                pdf.rect(HTMLtoPDFHelper.LEFT_MARGIN, pdfInfo.cumulativeContentHeight, (HTMLtoPDFHelper.a4Dimensions[0] - HTMLtoPDFHelper.LEFT_MARGIN - HTMLtoPDFHelper.RIGHT_MARGIN), 1, 'FD');
                pdfInfo.cumulativeContentHeight += 2;
                pdf.restoreGraphicsState();
                break;
            }
            default: {
                break;
            }
        }
    }
    postAddElementToPDF(element, pdf, pdfInfo) {
        switch (element.nodeName) {
            case 'OL':
            case 'UL': {
                pdfInfo.currentIndent -= HTMLtoPDFHelper.DEFAULT_INDENT;
                pdfInfo.indentLevel--;
                pdfInfo.listStack.shift();
                break;
            }
            case 'LI': {
                pdfInfo.currentIndent -= HTMLtoPDFHelper.DEFAULT_LIST_ITEM_INDENT;
                break;
            }
            default: {
                break;
            }
        }
        // remove the last font stack item
        pdfInfo.fontStack.shift();
        const preceedingStackItem = pdfInfo.fontStack[0];
        pdf.setFont(preceedingStackItem.fontName, preceedingStackItem.fontStyle);
        pdf.setFontSize(preceedingStackItem.fontSize);
    }
    preAddElementToPDF(element, pdf, pdfInfo) {
        let stackItem;
        switch (element.nodeName) {
            case 'H1': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H1_FONT_SIZE_CHANGE,
                    fontName: HTMLtoPDFHelper.DEFAULT_FONT,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                break;
            }
            case 'H2': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H2_FONT_SIZE_CHANGE,
                    fontName: HTMLtoPDFHelper.DEFAULT_FONT,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                break;
            }
            case 'H3': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H3_FONT_SIZE_CHANGE,
                    fontName: HTMLtoPDFHelper.DEFAULT_FONT,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                break;
            }
            case 'H4': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H4_FONT_SIZE_CHANGE,
                    fontName: HTMLtoPDFHelper.DEFAULT_FONT,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                break;
            }
            case 'H5': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H5_FONT_SIZE_CHANGE,
                    fontName: HTMLtoPDFHelper.DEFAULT_FONT,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                break;
            }
            case 'H6': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE + HTMLtoPDFHelper.H6_FONT_SIZE_CHANGE,
                    fontName: HTMLtoPDFHelper.DEFAULT_FONT,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                break;
            }
            case 'CODE': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: currentActiveItem.fontSize,
                    fontName: HTMLtoPDFHelper.CODE_ELEMENT_FONT,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                break;
            }
            case 'STRONG': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: 'Bold',
                    fontSize: currentActiveItem.fontSize,
                    fontName: currentActiveItem.fontName,
                    element
                };
                break;
            }
            case 'OL': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: currentActiveItem.fontSize,
                    fontName: currentActiveItem.fontName,
                    element
                };
                const listStackItem = {
                    element: element,
                    isNumbered: true,
                    itemCount: 0
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                pdfInfo.listStack.unshift(listStackItem);
                break;
            }
            case 'UL': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: currentActiveItem.fontSize,
                    fontName: currentActiveItem.fontName,
                    element
                };
                const listStackItem = {
                    element: element,
                    isNumbered: false,
                    itemCount: 0
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                pdfInfo.listStack.unshift(listStackItem);
                break;
            }
            case 'LI': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: '',
                    fontSize: currentActiveItem.fontSize,
                    fontName: currentActiveItem.fontName,
                    element
                };
                if (currentActiveItem.fontStyle !== '') {
                    stackItem.fontStyle = currentActiveItem.fontStyle;
                }
                const currentListItem = pdfInfo.listStack[0];
                currentListItem.itemCount++;
                break;
            }
            case 'EM': {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: 'Oblique',
                    fontSize: currentActiveItem.fontSize,
                    fontName: currentActiveItem.fontName,
                    element
                };
                break;
            }
            default: {
                const currentActiveItem = pdfInfo.fontStack[0];
                stackItem = {
                    fontStyle: currentActiveItem.fontStyle,
                    fontSize: currentActiveItem.fontSize,
                    fontName: currentActiveItem.fontName,
                    element
                };
                break;
            }
        }
        if (stackItem) {
            pdfInfo.fontStack.unshift(stackItem);
            pdf.setFont(stackItem.fontName, stackItem.fontStyle);
            pdf.setFontSize(stackItem.fontSize);
        }
    }
    convertElementToPDF(parentElement, element, pdf, pdfInfo, addExtraSpace) {
        if (element) {
            if (pdfInfo.pageCount === 0)
                pdfInfo.pageCount = 1;
            const elementHeight = this.computeElementHeight(element, pdfInfo, addExtraSpace);
            if ((pdfInfo.cumulativeContentHeight + elementHeight) >= (HTMLtoPDFHelper.a4Dimensions[1] - HTMLtoPDFHelper.BOTTOM_MARGIN)) {
                pdfInfo.pageCount++;
                pdf.addPage();
                pdf.setPage(pdfInfo.pageCount);
                pdfInfo.cumulativeContentHeight = HTMLtoPDFHelper.TOP_MARGIN;
            }
            this.preAddElementToPDF(element, pdf, pdfInfo);
            this.addElementToPDF(element, pdf, pdfInfo, addExtraSpace);
            element.childNodes.forEach((childElement) => {
                // @ts-ignore
                this.convertElementToPDF(element, childElement, pdf, pdfInfo, addExtraSpace);
            });
            this.postAddElementToPDF(element, pdf, pdfInfo);
        }
    }
    convertHTMLtoPDF(htmlContainerId, addExtraSpace) {
        let pdf = new jsPDF();
        pdf.setFont(HTMLtoPDFHelper.DEFAULT_FONT);
        pdf.setFontSize(HTMLtoPDFHelper.DEFAULT_FONT_SIZE);
        const htmlElement = document.getElementById(htmlContainerId);
        const pdfInfo = {
            lineSpacingInMM: HTMLtoPDFHelper.DEFAULT_FONT_SIZE * HTMLtoPDFHelper.MM_PER_FONT_POINT * (1 + HTMLtoPDFHelper.DEFAULT_LINE_SPACING),
            maxCharactersPerLineOfText: 2 * Math.floor((HTMLtoPDFHelper.a4Dimensions[0] - (HTMLtoPDFHelper.LEFT_MARGIN + HTMLtoPDFHelper.RIGHT_MARGIN)) / (HTMLtoPDFHelper.DEFAULT_FONT_SIZE * HTMLtoPDFHelper.MM_PER_FONT_POINT)),
            cumulativeContentHeight: HTMLtoPDFHelper.TOP_MARGIN,
            pageCount: 0,
            currentIndent: HTMLtoPDFHelper.LEFT_MARGIN,
            indentLevel: 0,
            fontStack: [{
                    fontName: HTMLtoPDFHelper.DEFAULT_FONT,
                    fontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE,
                    fontStyle: '',
                    element: htmlElement
                }],
            listStack: []
        };
        if (htmlElement)
            this.convertElementToPDF(null, htmlElement, pdf, pdfInfo, addExtraSpace);
        return { pdf, pdfInfo };
    }
}
HTMLtoPDFHelper.MM_PER_FONT_POINT = 0.3527777778;
HTMLtoPDFHelper.TOP_MARGIN = 10;
HTMLtoPDFHelper.LEFT_MARGIN = 10;
HTMLtoPDFHelper.BOTTOM_MARGIN = 10;
HTMLtoPDFHelper.RIGHT_MARGIN = 10;
HTMLtoPDFHelper.DEFAULT_INDENT = 10;
HTMLtoPDFHelper.DEFAULT_LIST_ITEM_INDENT = 5;
HTMLtoPDFHelper.DEFAULT_FONT = 'Helvetica';
HTMLtoPDFHelper.CODE_ELEMENT_FONT = 'Courier';
HTMLtoPDFHelper.DEFAULT_FONT_SIZE = 10;
HTMLtoPDFHelper.DEFAULT_LINE_SPACING = 0.2;
HTMLtoPDFHelper.a4Dimensions = [210, 297];
HTMLtoPDFHelper.H1_FONT_SIZE_CHANGE = 14;
HTMLtoPDFHelper.H2_FONT_SIZE_CHANGE = 12;
HTMLtoPDFHelper.H3_FONT_SIZE_CHANGE = 10;
HTMLtoPDFHelper.H4_FONT_SIZE_CHANGE = 8;
HTMLtoPDFHelper.H5_FONT_SIZE_CHANGE = 6;
HTMLtoPDFHelper.H6_FONT_SIZE_CHANGE = 4;
//# sourceMappingURL=HTMLtoPDFHelper.js.map