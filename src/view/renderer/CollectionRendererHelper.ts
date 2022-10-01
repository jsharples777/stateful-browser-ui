import debug from 'debug';
import {CollectionView} from "../interface/CollectionView";
import {CollectionViewRenderer} from "../interface/CollectionViewRenderer";
import {CollectionViewDOMConfig} from "../../ConfigurationTypes";

const logger = debug('collection-renderer-helper');

export class CollectionRendererHelper {
    private renderer: CollectionViewRenderer;
    private view: CollectionView;

    constructor(view: CollectionView, renderer: CollectionViewRenderer) {
        this.view = view;
        this.renderer = renderer;
    }

    insertDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        logger(`view ${this.view.getName()}: inserting result`);
        const childEl = this.renderer.createDisplayElementForCollectionItem(collectionName, item);
        const firstChildEl = containerEl.firstChild;
        if (firstChildEl) {
            containerEl.insertBefore(childEl, firstChildEl);
        } else {
            containerEl.appendChild(childEl);
        }
    }

    removeDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);
        const uiConfig: CollectionViewDOMConfig = this.view.getCollectionUIConfig();

        const querySelector = `${uiConfig.resultsElement.type}[${uiConfig.keyId}="${resultDataKeyId}"]`;
        logger(`view ${this.view.getName()}: removing result with query selector "${querySelector}"`);
        const childEl = containerEl.querySelector(querySelector);
        if (childEl) {
            containerEl.removeChild(childEl);
        }
    }

    updateDisplayElementForCollectionItem(containerEl: HTMLElement, collectionName: string, item: any): void {
        const resultDataKeyId = this.view.getIdForItemInNamedCollection(collectionName, item);
        const uiConfig: CollectionViewDOMConfig = this.view.getCollectionUIConfig();

        const querySelector = `${uiConfig.resultsElement.type}[${uiConfig.keyId}="${resultDataKeyId}"]`;
        logger(`view ${this.view.getName()}: updating result with query selector "${querySelector}"`);
        const oldChildEl = containerEl.querySelector(querySelector);
        if (oldChildEl) {
            const newChildEl = this.renderer.createDisplayElementForCollectionItem(collectionName, item);
            containerEl.insertBefore(newChildEl, oldChildEl);
            containerEl.removeChild(oldChildEl);
        } else {
            this.insertDisplayElementForCollectionItem(containerEl, collectionName, item);
        }
    }

}
