
import WindowDialog from "~/components/forms/WindowDialog.vue"
import * as Utils from '~~/lib/Utils';
import type { IRenderedTemplateComponent, IRenderedTemplateComponentProps } from "../componentTemplates";
import type { Container } from "inversify";
import TemplateFrame from "~/components/TemplateFrame.vue"
import type { SetupContext } from "vue";
import type { IListTemplateProps } from "../listTemplates/listTemplate";


let t: any;

export interface ISelectFormProps extends IRenderedTemplateComponentProps {
    title: string;
    componentTemplate: IRenderedTemplateComponent;
    choosedValues?: any;
}


export class SelectFormTemplate implements IRenderedTemplateComponent {

    protected _selected = ref([] as { value: any, title: string }[]);
    protected _diC: Container;
    protected _props: ISelectFormProps;
    protected _templateFrameRef = ref();


    constructor(_diC: Container, props: ISelectFormProps) {
        if (!t) t = useNuxtApp().$i18n.t;
        this._diC = _diC;
        this._props = props;
    }


    async setup(props, ctx: SetupContext) {
        this._props.choosedValues =  props.choosedValues;
        ctx.expose(this.expose())
        //if (this.props.choosedValues) {
        //    this.selected.value = await Utils.mapAsync(props.choosedValues, async (val, inx) => { return { value: val.value, title: val.title || await this.getTitleItemByVal(val) || "" } });
        // }
    }


    sprops = () => ["choosedValues"];



    expose() {
        return {
            eventsHandler: (e, d) => this._templateFrameRef.value.eventsHandler(e, d)
        }
    }


    protected _getFrameHeaderData() {
        const frameHeaderData = this._props.componentTemplate.getFrameHeaderData?.() || { title: this._props.title }
        frameHeaderData.title = this._props.title;
        return frameHeaderData;
    }



    /**Поле выбранных значений */
    getChoosePanel() {
        return <v-sheet class="h-100 w-100" >
            <v-row class="h-100 w-100" no-gutters>
                <v-row no-gutters class="align-center h-25 w-100" style="margin-bottom:-5px;">
                    <p>Выбранное</p>
                    <v-spacer />
                    <v-btn ripple={false} style={(this._selected.value.length == 0) ? "visibility:hidden;" : ""} icon="mdi-close-circle" variant="plain" color="secondary"
                        onClick={() => this._selected.value.length = 0} />
                </v-row>

                <v-row class="h-50 w-100" no-gutters>
                    <v-sheet class="overflow-y-auto h-100  w-100" border >
                        {
                            this._selected.value.map((item, inx) =>
                                <v-chip key={item.value} closable onClick:close={(e) => { this._selected.value.splice(inx, 1); }}>{item.title}</v-chip>)
                        }
                    </v-sheet>
                </v-row>
            </v-row>
        </v-sheet>
    }



    render() {
        return (createElement, context) =>
            <WindowDialog diC={this._diC} frameHeaderData={this._getFrameHeaderData()} onOk={() => { return this._templateFrameRef.value.getSelected(); }}>
                <v-col class="h-100">
                    <v-row class="overflow-y-auto h-100" no-gutters >
                        <TemplateFrame ref={this._templateFrameRef} templateInstance={this._props.componentTemplate} props={{ choosedValues: this._props.choosedValues } as IListTemplateProps} />
                    </v-row>
                </v-col>
            </WindowDialog>
    }
}