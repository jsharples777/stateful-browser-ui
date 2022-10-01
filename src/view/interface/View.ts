import {ViewListener} from "./ViewListener";
import {ViewVisibility} from "./ViewVisibility";
import {ViewDOMConfig} from "../../ConfigurationTypes";

export interface View extends ViewVisibility {
    getName(): string;

    setContainedBy(container: HTMLElement): void;

    addEventListener(listener: ViewListener): void;

    hasChanged(): boolean;

    getUIConfig(): ViewDOMConfig;

    getDataSourceKeyId(): string;

    render(): void;

    clearDisplay(): void;

    getItemId(from: string, item: any): string;

    getItemDescription(from: string, item: any): string;

    hasActionPermission(actionName: string, from: string, item: any): boolean;

}
