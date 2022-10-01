import {ViewContainer} from "./ViewContainer";

export interface ContainerVisibilityListener {
    nowShowing(container: ViewContainer): void;

    nowHidden(container: ViewContainer): void;
}
