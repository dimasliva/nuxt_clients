
import WindowDialog from "../../../../WindowDialog.vue"
import * as Utils from '~/src/common/lib/Utils';
import type { Container } from "inversify";
import type { TDictViewVal } from "~uilib/FinderDataProviders/FinderDataProvider";
import { FinderFormTemplate, type IFinderFormProps } from "../../FinderFormTemplate";


export interface IFinderFormMultipleProps extends IFinderFormProps {
    choosedValues?: any[];
}

let t: any;


export class FinderFormMultipleTemplate extends FinderFormTemplate {

    selected = ref([] as { value: any, title: string }[]);
    /**Последнее значение в строке поиска, которое учитывалось для статистики введенных значений*/
    lastSearchStrForStat = "";



    constructor(deps: Container, props: IFinderFormProps) {
        super(deps, props);
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
        //closeDialog(res);
        return res;
    }


    override catalogShow() {
        if (this._props.selectFormComponent) {
            openDialog(
                this._props.selectFormComponent,
                { width: "100%" },
                true,
                true,
                (e, d) => {
                    if (e == "onBeforeClose") {
                        if (d) {
                            nextTick(async () => {
                                const res = await this.getTitleItemsByVals(d);
                                if (res.length > 0) {
                                    res.forEach((v) => {
                                        if (v.title != undefined)
                                            if (this.selected.value.find(item => item.value == v.value) == null)
                                                this.selected.value.push(v as TDictViewVal);
                                    });

                                }
                            });
                        }
                    }
                    return true;
                }
            );
        }
    }


    /**Поле выбранных значений */
    getChoosePanel() {
        return <v-sheet class="h-100 w-100 d-flex flex-column" >
            <v-row no-gutters class="align-center flex-0-1" style="margin-bottom:-5px;">
                <p>Выбранное</p>
                <v-spacer />
                <v-btn ripple={false} style={(this.selected.value.length == 0) ? "visibility:hidden;" : ""} icon="mdi-close-circle" variant="plain" color="secondary"
                    onClick={() => this.selected.value.length = 0} />
            </v-row>

            <v-sheet class="overflow-y-auto flex-1-1" border >
                {
                    this.selected.value.map((item, inx) =>
                        <v-chip key={item.value} closable onClick:close={(e) => { this.selected.value.splice(inx, 1); }}>{item.title}</v-chip>)
                }
            </v-sheet>

        </v-sheet>
    }



    override render() {
        return (createElement, context) =>
            <WindowDialog diC={this._diC} frameHeaderData={{ title: this._props.title }} width="700" height="100%" onOk={() => this.onOk()}>
                <div class="d-flex flex-column h-100">

                    {this.getMainSearchField()}

                    <v-row class="overflow-y-auto flex-0-1" style="height:60%" >
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

                    <v-row lass="flex-1-1" no-gutters style="height:1%">
                        {
                            this.getChoosePanel()
                        }
                    </v-row>
                </div>

            </WindowDialog>
    }
}