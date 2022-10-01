import { CollectionViewEventHandlerDelegate } from "./CollectionViewEventHandlerDelegate";
import { ContextualInformationHelper } from "../../context/ContextualInformationHelper";
export class CollectionViewEventHandlerDelegateUsingContext extends CollectionViewEventHandlerDelegate {
    constructor(view, forwarder) {
        super(view, forwarder);
    }
    getItemContext(event) {
        const contextDetail = ContextualInformationHelper.getInstance().findContextFromEvent(event);
        let context;
        if (contextDetail) {
            context = {
                itemId: contextDetail.identifier,
                dataSource: contextDetail.source
            };
        }
        else {
            context = {
                itemId: '',
                dataSource: this.view.getName(),
            };
        }
        return context;
    }
}
//# sourceMappingURL=CollectionViewEventHandlerDelegateUsingContext.js.map