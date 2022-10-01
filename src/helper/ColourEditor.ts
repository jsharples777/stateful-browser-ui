import debug from 'debug';
import {browserUtil, Field, FieldDefinition, FieldEditor, getElementOffset} from "browser-state-management";

const logger = debug('colour-editor');


export class ColourEditor implements FieldEditor {
    protected colourPickerContainerId: string;
    protected field: Field | null = null;
    protected container: HTMLElement | null = null;

    constructor(colourPickerContainerId: string) {
        this.colourPickerContainerId = colourPickerContainerId;
        this.editValue = this.editValue.bind(this);
        this.editCompleted = this.editCompleted.bind(this);
        this.cbColourChange = this.cbColourChange.bind(this);
        this.container = document.getElementById(this.colourPickerContainerId);
        if (this.container) {
            browserUtil.addClasses(this.container, 'd-none');
            $(this.container).farbtastic(this.cbColourChange);
        }
    }

    editCompleted(field: Field, fieldDef: FieldDefinition): void {
        logger(`Field at edit completed`);
        this.field = field;
        if (this.container) browserUtil.addClasses(this.container, 'd-none');
    }

    editValue(field: Field, fieldDef: FieldDefinition, currentValue: string): string {
        this.field = field;
        logger(`Field at edit value`);
        logger(this.field);
        // do we have a valid value?
        if (/^#[0-9a-f]{6}$/.test(currentValue) && this.container) {
            // @ts-ignore
            this.container['data-field'] = field;
            $.farbtastic(this.container).setColor(currentValue);
        }
        if (field && this.container) {
            let element = field.getElement();
            let offset = getElementOffset(element);
            offset.top += element.offsetHeight;
            browserUtil.removeAttributes(this.container, ['style']);
            browserUtil.addAttributes(this.container, [{
                name: 'style',
                value: `top:${offset.top}px; left: ${offset.left}px;`
            }]);
            browserUtil.removeClasses(this.container, 'd-none');
        }

        return currentValue;
    }

    cbColourChange(colour: string) {
        logger(`Colour changed to ${colour}`);
        if (/^#[0-9a-f]{6}$/.test(colour)) {
            logger(`Field at CB Colour Change`);
            logger(this.field);

            // @ts-ignore
            let field = this.container['data-field']
            logger(field);

            if (this.field) this.field.setValue(colour);
            if (field) field.setValue(colour);
            if (this.container) browserUtil.addClasses(this.container, 'd-none');
        }
    }


}
