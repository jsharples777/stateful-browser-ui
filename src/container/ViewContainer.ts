import {ViewVisibility} from "../view/interface/ViewVisibility";
import {ContainerVisibilityListener} from "./ContainerVisibilityListener";

export interface ViewContainer extends ViewVisibility {
    addVisibilityListener(listener: ContainerVisibilityListener): void;

}
