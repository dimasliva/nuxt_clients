
import WindowDialog from "~/components/forms/WindowDialog.vue"
import { FinderFormTemplate, type IFinderFormProps } from "./finderFormTemplate";
import * as Utils from '~~/lib/Utils';
import type { IFrameHeaderData } from "~/lib/PageMap";
import type { Container } from "inversify";


export interface IFinderFormMultipleProps extends IFinderFormProps {
    choosedValues?: any[];
}

let t: any;


export abstract class FinderFormMultipleTemplate extends FinderFormTemplate {

    selected = ref([] as { value: any, title: string }[]);
    /**Последнее значение в строке поиска, которое учитывалось для статистики введенных значений*/
    lastSearchStrForStat = "";



    constructor(deps: Container, props: IFinderFormProps) {
        super(deps,props);
    }



    override async setup(props: IFinderFormMultipleProps, ctx?) {
        await super.setup(props, ctx);
        if (!t) t = useNuxtApp().$i18n.t;
        if (props.choosedValues) {
            this.selected.value = await Utils.mapAsync(props.choosedValues, async (val, inx) => { return { value: val.value, title: val.title || await this.getTitleItemByVal(val) || "" } });
        }
    }



    override async onSelect(e: any[]) {
        if (this.lastSearchStrForStat != this._searchingText.value && this._searchingText.value) {
            this.lastSearchStrForStat = this._searchingText.value
            this._searchStrStatistic.addItem(this._searchingText.value);
        }

        let val = e[0];
        if (val != null && this.selected.value.find(item => item.value == val.value) == null) {
            this.selected.value.push({ value: val.value, title: val.title || await this.getTitleItemByVal(val) || "" });
        }
    }



    onOk() {
        let res = this.selected.value.map(item => {
            this._resultHistoryStatistic.addItem(item.value);
            return item
        });
        closeDialog(res);
    }


    /**Поле выбранных значений */
    getChoosePanel() {
        return <v-sheet class="h-100 w-100" >
            <v-row no-gutters class="align-center" style="margin-bottom:-5px;">
                <p>Выбранное</p>
                <v-spacer />
                <v-btn ripple={false} style={(this.selected.value.length == 0) ? "visibility:hidden;" : ""} icon="mdi-close-circle" variant="plain" color="secondary"
                    onClick={() => this.selected.value.length = 0} />
            </v-row>

            <v-sheet class="overflow-y-auto h-100" border >
                {
                    this.selected.value.map((item, inx) =>
                        <v-chip key={item.value} closable onClick:close={(e) => { this.selected.value.splice(inx, 1); }}>{item.title}</v-chip>)
                }
            </v-sheet>

        </v-sheet>
    }



    override render() {
        return (createElement, context) =>
            <WindowDialog diC={this._diC} frameHeaderData={{ title: this._props.title }} width="700" height="85dvh" onOk={() => this.onOk()}>
                {this.getMainSearchField()}

                <v-row style="height:60%;" class="overflow-y-auto" >
                    {
                        this._loading.value ?
                            <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                            :
                            this._valueList.value == null ?
                                this.getMostFreqChoose(95)
                                :
                                (this._valueList.value.length > 0) ? this.getResultListField() : this.getEmptyResultListField()
                    }
                </v-row>

                <v-row style="height:27%;" >
                    {
                        this.getChoosePanel()
                    }
                </v-row>

            </WindowDialog>
    }
}