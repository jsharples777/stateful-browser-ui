import { DetailView } from "./DetailView";
import { DetailViewListenerForwarder } from "../delegate/DetailViewListenerForwarder";
import { DetailViewRuntimeConfig } from "../../ConfigurationTypes";
export interface DetailViewRenderer extends DetailView {
    reset(): void;
    initialise(runtimeConfig: DetailViewRuntimeConfig): void;
    displayItemReadonly(dataObject: any): void;
    setEventForwarder(forwarder: DetailViewListenerForwarder): void;
    setView(view: DetailView): void;
}
