
import { QueryParams } from "~/lib/MoApi/RequestArgs";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { UserContext } from "~/lib/UserContext";
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~~/libVis/Helpers';
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import WindowDialog from "~/components/forms/WindowDialog.vue"
import { sleep } from "~/lib/Helpers";
import { FreqUsingStrStatistic } from "~/libVis/FreqUsingStrStatistic";
import type { FinderDataProvider } from "~/libVis/FinderDataProvider";



let t: any;

export interface IFinderFormProps {
    label?: string,
    title: string,
    finderDataProvider: FinderDataProvider
}


export abstract class FinderFormTemplate {

    iocc = useContainer();
    userCtx = this.iocc.get<UserContext>('UserContext');
    searchStrStatistic= this.iocc.get(FreqUsingStrStatistic); 
    resultHistoryStatistic= this.iocc.get(FreqUsingStrStatistic); 
    loading = ref(false);
    props: IFinderFormProps = null!;
    ctx?: any|null = null;

    valueList = ref(null as { value: any, title: string }[] | null);
    searchingText = ref();
    searchFieldRef = ref();
    selected = ref([]);
    searchedStrLst=ref<string[]>([]);
    historyResultLst=ref([] as { value: any, title: string }[]);

    lastFindRequestDate: number | null = null;
    searchTimeout: any | null = null;
    //testprop:Ref<any>;


    constructor() {
        if (!t) t = useNuxtApp().$i18n.t;
    }



    async setup(props: IFinderFormProps, ctx?) {
        this.loading.value = false;
        this.props = props;
        this.ctx = ctx;
        this.searchStrStatistic.init(this.props.finderDataProvider.getInstName() || "default");
        this.resultHistoryStatistic.init((this.props.finderDataProvider.getInstName()+"hist_res") || "default_hist_res");

        onMounted(() => {
            nextTick((() => setTimeout(() => { this.searchFieldRef.value.focus(); }, 10)));
        });

        this.searchedStrLst.value = this.searchStrStatistic.getMostFreq(100);

        const histRes = this.resultHistoryStatistic.getMostFreq(20);
        this.historyResultLst.value = [];

        for (let i = 0; i < histRes.length; i++)
            this.historyResultLst.value.push({ value: histRes[i], title: await this.props.finderDataProvider.getTitle(histRes[i]) || '' })

        // this.testprop=computed(()=>[{value: 1, title:"wsdd"},{value: 2, title:"dfgfg"}])
    }



    _onfindSingleExec = false;

    async onFind() {
        if (this._onfindSingleExec)
            return;

        this._onfindSingleExec = true;
        try {
            if (this.searchingText.value) {
                let diff = this.lastFindRequestDate ? Date.now() - this.lastFindRequestDate : 1000;
                if (diff < 1000)
                    await sleep(1000 - diff);
                this.valueList.value = await this.props.finderDataProvider.getList(this.searchingText.value);
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
        if (this.searchingText.value)
            this.searchStrStatistic.addItem(this.searchingText.value);
        e.forEach(val => this.resultHistoryStatistic.addItem(val.toString()));
        closeDialog(e);
    }



    onSearchTextInput() {
        if (this.searchTimeout)
            clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            this.onFind();
        }, 1000);
    }



    eventsHandler(e: string, d: any) {
        switch (e) {
            case "onKeydown":
                //d.preventDefault();

                if (d.key == "ArrowDown" || d.key == "ArrowUp")
                    return true;
                if (d.key == 'Escape') {
                    closeDialog(null);
                    return false;
                }
                if (d.key == 'Enter')
                {
                    if(this.searchFieldRef.value.focused)
                         this.onFind();
                }
                else
                    this.searchFieldRef.value.focus();
                return true;
        }
    }


    //https://github.com/vuejs/babel-plugin-jsx#installation
    //https://v3.ru.vuejs.org/ru/guide/render-function.html#jsx

    getListsField() {
        return <v-card class="overflow-y-auto w-100" style="height:90%;">
            <v-list lines="one" density="compact" class="ma-0 pa-0" items={this.valueList.value}  v-model:selected={this.selected.value} 
             onUpdate:selected={(e)=>{this.onSelect(e)}} 
            />
        </v-card>
    }



    getMostFreqChoose() {
        return <v-card class="overflow-y-auto w-100" style="height:90%;" color="tertiary">
             <v-card-item prepend-icon="mdi-history">
                 <v-card-title class="font-weight-bold">Часто используемые</v-card-title>
            </v-card-item>
            <v-list bg-color="tertiary" lines="one" density="compact" class="ma-0 pa-0" items={this.historyResultLst.value}  v-model:selected={this.selected.value} 
             onUpdate:selected={(e)=>{this.onSelect(e)}} 
            />
        </v-card>
    }



    getEmptyListsField() {
        return undefined;
    }



    render() {
        return (createElement, context) =>
            <WindowDialog title={this.props.title} width="700" height="85dvh" okTitle={null}>
                <v-autocomplete ref={this.searchFieldRef} clearable label={this.props.label || ''}
                    variant="underlined" density="compact" modelValue={this.searchingText.value}
                    items={this.searchedStrLst.value}
                    prepend-icon="mdi-magnify" auto-select-first
                    autofocus
                    onInput={() => this.onSearchTextInput()}
                    //onUpdate:search={(val) => { if(val) this.ctx.emit("update:modelValue", val); }}
                    //onUpdate:search={(val) => {  if (val) this.searchFieldRef.value.$emit("update:modelValue", val); }}
                    onUpdate:search={(val) => { if (val) this.searchingText.value = val }}
                    onUpdate:modelValue={(val => { this.searchingText.value = val; if (val) this.onFind(); else this.valueList.value=null})}
                >
                    {{
                        "no-data": () => undefined
                    }}
                </v-autocomplete>

                {
                    this.loading.value ?
                        <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                        :
                        this.valueList.value == null ?
                            this.getMostFreqChoose()
                            :
                            (this.valueList.value.length > 0) ? this.getListsField() : this.getEmptyListsField()
                }


            </WindowDialog>
    }
}