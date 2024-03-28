
import { UserContext } from "~/lib/UserContext";
import WindowDialog from "~/components/forms/WindowDialog.vue"
import { sleep } from "~/lib/Helpers";
import { FreqUsingStrStatistic } from "~/libVis/FreqUsingStrStatistic";
import type { FinderDataProvider, TDictViewVal } from "~/libVis/FinderDataProviders/FinderDataProvider";
import type { Container } from "inversify/lib/container/container";



let t: any;

export interface IFinderFormProps {
    diC?: Container | null;
    label?: string,
    title: string,
    finderDataProvider: FinderDataProvider
    historyResultTypeStorage?: EFinderFormHistoryResultTypeStorage,
    apiRequestTimeout?: number;
}


export enum EFinderFormHistoryResultTypeStorage {
    none,
    full,
    valOnly
}


export abstract class FinderFormTemplate {

    iocc = useContainer();
    userCtx = this.iocc.get<UserContext>('UserContext');
    searchStrStatistic = this.iocc.get(FreqUsingStrStatistic);
    resultHistoryStatistic = this.iocc.get(FreqUsingStrStatistic);
    loading = ref(false);
    props: IFinderFormProps = null!;
    ctx?: any | null = null;

    valueList = ref(null as TDictViewVal[] | null);
    searchingText = ref();
    searchFieldRef = ref();
    searchedStrLst = ref<(string | number)[]>([]);
    historyResultLst = ref([] as TDictViewVal[]);
    historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.none;

    lastFindRequestDate: number | null = null;
    searchTimeout: any | null = null;
    apiRequestTimeout = 1000;
    //testprop:Ref<any>;


    constructor() {
        if (!t) t = useNuxtApp().$i18n.t;
    }



    async setup(props: IFinderFormProps, ctx?) {
        this.loading.value = false;
        this.props = props;
        this.ctx = ctx;
        this.searchStrStatistic.init(this.props.finderDataProvider.getInstName() || "default");
        this.resultHistoryStatistic.init((this.props.finderDataProvider.getInstName() + "hist_res") || "default_hist_res");
        this.historyResultTypeStorage = props.historyResultTypeStorage || EFinderFormHistoryResultTypeStorage.none;
        this.apiRequestTimeout = props.apiRequestTimeout || 1000;

        onMounted(() => {
            nextTick((() => setTimeout(() => { this.searchFieldRef.value.focus(); }, 10)));
        });

        this.searchedStrLst.value = this.searchStrStatistic.getMostFreq(100).map(val => val.value);

        const histRes = this.resultHistoryStatistic.getMostFreq(20);
        this.historyResultLst.value = [];

        for (let i = 0; i < histRes.length; i++)
            this.historyResultLst.value.push({ value: histRes[i].value, title: histRes[i].title || await this.getTitleItemByVal(histRes[i].value) || '' })

        // this.testprop=computed(()=>[{value: 1, title:"wsdd"},{value: 2, title:"dfgfg"}])
    }



    async getTitleItemByVal(val: string | number) {
        return await this.props.finderDataProvider.getTitle(val);
    }


    _onfindSingleExec = false;

    async getValueList() {
        return await this.props.finderDataProvider.getList(this.searchingText.value);
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
                this.valueList.value = await this.getValueList();
                this.lastFindRequestDate = Date.now();
            }
            else
                this.valueList.value = null;
        }
        finally {
            this._onfindSingleExec = false;
        }
    }



    async onSelect(e: TDictViewVal[]) {
        if (this.searchingText.value)
            this.searchStrStatistic.addItem(this.searchingText.value);

        if (this.historyResultTypeStorage != EFinderFormHistoryResultTypeStorage.none)
            if (this.historyResultTypeStorage == EFinderFormHistoryResultTypeStorage.valOnly)
                e.forEach(val => this.resultHistoryStatistic.addItem(val.value));
            else
                e.forEach(val => this.resultHistoryStatistic.addItem(val.value, val.title));
        closeDialog(e[0]);
    }



    onSearchTextInput() {
        if (this.searchTimeout)
            clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            this.onFind();
        }, 1000);
    }



    async onMostFreqChooseClear() {
        if (await useQU("Очистить список?")) {
            this.historyResultLst.value.length = 0;
            this.resultHistoryStatistic.clear();
        }
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
                if (d.key == 'Enter') {
                    if (this.searchFieldRef.value.focused)
                        this.onFind();
                }
                else
                    this.searchFieldRef.value.focus();
                return true;
        }
    }


    //https://github.com/vuejs/babel-plugin-jsx#installation
    //https://v3.ru.vuejs.org/ru/guide/render-function.html#jsx

    /**Список найденных значений */
    getResultListField() {
        return <v-card class="overflow-y-auto w-100" style="height:90%;">
            <v-list lines="one" density="compact" class="ma-0 pa-0" items={this.valueList.value}
                onUpdate:selected={(e) => { this.onSelect(this.valueList.value!.filter(item => item.value == e[0])) }}
            />
        </v-card>
    }


    /**Список часто выбираемых значений */
    getMostFreqChoose(height: number) {
        return <v-card class="overflow-y-auto w-100" style={`height:${height}%;`} color="tertiary">

            <v-card-item prepend-icon="mdi-history">
                {{
                    title: () =>
                        <v-row no-gutters class='align-center'>
                            <p class='text-h6'>Часто используемые</p>
                            <v-spacer />
                            <v-btn ripple={false} style={(this.historyResultLst.value.length == 0) ? "visibility:hidden;" : ""} icon="mdi-delete" variant="plain" color="secondary"
                                onClick={() => this.onMostFreqChooseClear()} />
                        </v-row>
                }}
            </v-card-item>

            <v-list bg-color="tertiary" lines="one" density="compact" class="ma-0 pa-0" items={this.historyResultLst.value}
                onUpdate:selected={(e) => { this.onSelect(this.historyResultLst.value!.filter(item => item.value == e[0])) }}
            />
        </v-card>
    }



    getEmptyResultListField() {
        return undefined;
    }


    /**Основная строка поиска */
    getMainSearchField() {
        return <v-autocomplete ref={this.searchFieldRef} clearable label={this.props.label || ''}
            variant="underlined" density="compact" modelValue={this.searchingText.value}
            items={this.searchedStrLst.value}
            prepend-icon="mdi-magnify" auto-select-first="exact"
            autofocus
            onInput={() => this.onSearchTextInput()}
            //onUpdate:search={(val) => { if(val) this.ctx.emit("update:modelValue", val); }}
            //onUpdate:search={(val) => {  if (val) this.searchFieldRef.value.$emit("update:modelValue", val); }}
            onUpdate:search={(val) => { if (val) this.searchingText.value = val }}
            onUpdate:modelValue={(val => { this.searchingText.value = val; if (val) this.onFind(); else this.valueList.value = null })}
        >
            {{
                "no-data": () => undefined
            }}
        </v-autocomplete>;
    }



    render() {
        return (createElement, context) =>
            <WindowDialog diC={this.props.diC} frameHeaderData={{ title: this.props.title }} width="700" height="85dvh" okTitle={null}>
                {this.getMainSearchField()}

                {
                    this.loading.value ?
                        <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                        :
                        (this.historyResultTypeStorage != EFinderFormHistoryResultTypeStorage.none && this.valueList.value == null) ?
                            this.getMostFreqChoose(90)
                            :
                            (this.valueList.value != null && this.valueList.value.length > 0) ? this.getResultListField() : this.getEmptyResultListField()
                }
            </WindowDialog>
    }
}