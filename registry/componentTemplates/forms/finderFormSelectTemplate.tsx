
import WindowDialog from "~/components/forms/WindowDialog.vue"
import { FinderFormTemplate, type IFinderFormProps } from "./finderFormTemplate";
import * as Utils from '~~/lib/Utils';
import type { IFrameHeaderData } from "~/lib/PageMap";
import { sleep } from "~/lib/Helpers";


export interface IFinderFormSelectProps extends IFinderFormProps {
    choosedValues?: any[];
    selectedOptionsValues?: any[];
}

let t: any;


export abstract class FinderFormSelectTemplate extends FinderFormTemplate {

    sections = ref([] as { id: string, title: string }[])
    selectedSections = ref<any>([])

    selected = ref([] as { value: any, title: string }[]);
    /**Последнее значение в строке поиска, которое учитывалось для статистики введенных значений*/
    lastSearchStrForStat = "";



    async setup(props: IFinderFormSelectProps, ctx?) {
        await super.setup(props, ctx);
        if (!t) t = useNuxtApp().$i18n.t;
        if (props.choosedValues) {
            this.selected.value = await Utils.mapAsync(props.choosedValues, async (val, inx) => { return { value: val.value, title: val.title || await this.getTitleItemByVal(val) || "" } });
        }
        if (props.selectedOptionsValues) {
            this.sections.value = props.selectedOptionsValues;
        }
    }

    async onFind() {
        if (this._onfindSingleExec)
            return;

        this._onfindSingleExec = true;
        try {
            if (this.searchingText.value) {
                let diff = this.lastFindRequestDate ? Date.now() - this.lastFindRequestDate : this.apiRequestTimeout;
                if (diff < this.apiRequestTimeout)
                    await sleep(this.apiRequestTimeout - diff);
                this.valueList.value = await this.props.finderDataProvider.getList(this.searchingText.value, this.selectedSections.value);
                this.lastFindRequestDate = Date.now();
            }
            else
                this.valueList.value = null;
        }
        finally {
            this._onfindSingleExec = false;
        }
    }


    async onSelect(e: any[]) {
        if (this.lastSearchStrForStat != this.searchingText.value && this.searchingText.value) {
            this.lastSearchStrForStat = this.searchingText.value
            this.searchStrStatistic.addItem(this.searchingText.value);
        }

        let val = e[0];
        if (val != null && this.selected.value.find(item => item.value == val.value) == null) {
            this.selected.value.push({ value: val.value, title: val.title || await this.getTitleItemByVal(val) || "" });
        }
    }



    onOk() {
        let res = this.selected.value.map(item => {
            this.resultHistoryStatistic.addItem(item.value);
            return item
        });
        closeDialog(res);
    }

    /**Поле для выбора из списка*/
    getSelectPanel(){
        const isAllSelected = () => {
            return this.selectedSections.value.length === this.sections.value.length 
        }
        const toggle = () =>  {
            if (isAllSelected()) {
              this.selectedSections.value = []
            } else {
              this.selectedSections.value = this.sections.value.slice()
            }
        }
        return <v-select chips closable-chips multiple label="Искать в:" items={this.sections.value} v-model={this.selectedSections.value}
         item-title="title" item-value="id" variant="underlined">
              {{ 
                "prepend-item": () => 
                <>
                    <v-list-item title="Все" onClick={toggle}>
                        {{ prepend: () => 
                        <v-checkbox-btn modelValue={isAllSelected()}></v-checkbox-btn>
                        }}
                    </v-list-item>
                    <v-divider></v-divider>
                </>
            }} 

         </v-select>
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



    render() {
        return (createElement, context) =>
            <WindowDialog diC={this.props.diC} frameHeaderData={{ title: this.props.title }} width="700" height="85dvh" onOk={() => this.onOk()}>
                {this.getMainSearchField()}

                <v-row style="height: auto">
                    {
                        this.getSelectPanel()
                    }
                </v-row>

                <v-row style="height:40%;" class="overflow-y-auto" >
                    {
                        this.loading.value ?
                            <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                            :
                            this.valueList.value == null ?
                                this.getMostFreqChoose(95)
                                :
                                (this.valueList.value.length > 0) ? this.getResultListField() : this.getEmptyResultListField()
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