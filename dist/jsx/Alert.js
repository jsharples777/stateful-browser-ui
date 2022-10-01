/** @jsx jsxCreateElement */
/*** @jsxFrag jsxCreateFragment */
import { jsxCreateElement } from './JSXParser';
// @ts-ignore
export function Alert(props) {
    return (jsxCreateElement("div", { className: "modal d-none", tabIndex: 1, role: "dialog", id: "alert" },
        jsxCreateElement("div", { className: "modal-dialog", role: "document" },
            jsxCreateElement("div", { className: "modal-content" },
                jsxCreateElement("div", { className: "modal-header" },
                    jsxCreateElement("h5", { className: "modal-title", id: "alert-title" }, "Modal title"),
                    jsxCreateElement("button", { type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close", id: "alert-close" },
                        jsxCreateElement("span", { "aria-hidden": "true" }, "\u00D7"))),
                jsxCreateElement("div", { className: "modal-body" },
                    jsxCreateElement("p", { id: "alert-content" }, "Modal body text goes here.")),
                jsxCreateElement("div", { className: "modal-footer" },
                    jsxCreateElement("button", { type: "button", className: "btn btn-primary", id: "alert-confirm" }, "Confirm"),
                    jsxCreateElement("button", { type: "button", className: "btn btn-secondary", "data-dismiss": "modal", id: "alert-cancel" }, "Cancel"))))));
}
//# sourceMappingURL=Alert.js.map