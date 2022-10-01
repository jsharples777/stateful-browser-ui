import { View } from "../interface/View";
import { ViewListenerForwarder } from "../delegate/ViewListenerForwarder";
import { ViewListener } from "../interface/ViewListener";
import { ViewDOMConfig } from "../../ConfigurationTypes";
export declare abstract class AbstractView implements View {
    static DATA_SOURCE: string;
    protected uiConfig: ViewDOMConfig;
    protected eventForwarder: ViewListenerForwarder;
    protected containerEl: HTMLElement | null;
    protected viewEl: HTMLElement | null;
    protected viewHasChanged: boolean;
    protected isVisible: boolean;
    protected constructor(uiConfig: ViewDOMConfig);
    getItemId(from: string, item: any): string;
    getItemDescription(from: string, item: any): string;
    hasActionPermission(actionName: string, from: string, item: any): boolean;
    getUIConfig(): ViewDOMConfig;
    addEventListener(listener: ViewListener): void;
    onDocumentLoaded(): void;
    setContainedBy(container: HTMLElement): void;
    getName(): string;
    hasChanged(): boolean;
    getDataSourceKeyId(): string;
    hide(): void;
    show(): void;
    handleDrop(event: Event): void;
    abstract clearDisplay(): void;
    abstract render(): void;
    isShowing(): boolean;
}