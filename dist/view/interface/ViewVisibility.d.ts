import { DocumentLoaded } from "browser-state-management";
export interface ViewVisibility extends DocumentLoaded {
    isShowing(): boolean;
    show(): void;
    hide(): void;
}
