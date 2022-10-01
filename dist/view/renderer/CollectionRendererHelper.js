import debug from 'debug';
const logger = debug('collection-renderer-helper');
export class CollectionRendererHelper {
    constructor(view, renderer) {
        this.view = view;
        this.renderer = renderer;
    }
    insertDisplayElementForCollectionItem(containerEl, collectionName, item) {
        logger(`view ${this.view.getName()}: inserting result`);
        const childEl = this.renderer.createDisplayElementForCollectionItem(collectionName, item);
        const firstChildEl = containerEl.firstChild;
        if (firstChildEl) {
            containerEl.insertBefore(childEl, firstChildEl);
        }
        else {
            containerEl.appendChild(childEl);
        }
    }
    removeDisplayElementForCollectionItem(containerEl, collectionName, item) {
        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);
        const uiConfig = this.view.getCollectionUIConfig();
        const querySelector = `${uiConfig.resultsElement.type}[${uiConfig.keyId}="${resultDataKeyId}"]`;
        logger(`view ${this.view.getName()}: removing result with query selector "${querySelector}"`);
        const childEl = containerEl.querySelector(querySelector);
        if (childEl) {
            containerEl.removeChild(childEl);
        }
    }
    updateDisplayElementForCollectionItem(containerEl, collectionName, item) {
        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);
        const uiConfig = this.view.getCollectionUIConfig();
        const querySelector = `${uiConfig.resultsElement.type}[${uiConfig.keyId}="${resultDataKeyId}"]`;
        logger(`view ${this.view.getName()}: updating result with query selector "${querySelector}"`);
        const oldChildEl = containerEl.querySelector(querySelector);
        if (oldChildEl) {
            const newChildEl = this.renderer.createDisplayElementForCollectionItem(collectionName, item);
            containerEl.insertBefore(newChildEl, oldChildEl);
            containerEl.removeChild(oldChildEl);
        }
        else {
            this.insertDisplayElementForCollectionItem(containerEl, collectionName, item);
        }
    }
}
//# sourceMappingURL=CollectionRendererHelper.js.map