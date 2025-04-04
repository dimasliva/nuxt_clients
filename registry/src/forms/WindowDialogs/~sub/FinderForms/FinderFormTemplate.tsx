
import { UserContext } from "~/src/common/lib/UserContext";
import WindowDialog from "../../WindowDialog.vue"
import { sleep } from "~/src/common/lib/Helpers";
import { FreqUsingStrStatistic } from "~uilib/FreqUsingStrStatistic";
import type { FinderDataProvider, TDictViewVal } from "~uilib/FinderDataProviders/FinderDataProvider";
import { Container } from "inversify";
import type { IRenderedTemplateComponent, IRenderedTemplateComponentProps } from "~components/types";
import { useQU } from "~/src/common/composables/useActionDialog";


export enum EFinderFormHistoryResultTypeStorage {
    none,
    full,
    valOnly
}


export interface IFinderFormProps extends IRenderedTemplateComponentProps {
    label?: string,
    title: string,
    finderDataProvider: FinderDataProvider
    historyResultTypeStorage?: EFinderFormHistoryResultTypeStorage,
    apiRequestTimeout?: number;
    selectFormComponent?: any;// component of SelectFormTemplate
}

let t: any;


export class FinderFormTemplate implements IRenderedTemplateComponent {

    protected _diC: Container;
    protected _userCtx: UserContext;
    protected _searchStrStatistic: FreqUsingStrStatistic;
    protected _resultHistoryStatistic: FreqUsingStrStatistic;
    protected _loading = ref(false);
    protected _props: IFinderFormProps;
    protected _ctx?: any | null = null;

    protected _valueList = ref(null as TDictViewVal[] | null);
    protected _searchingText = ref();
    protected _searchFieldRef = ref();
    protected _searchedStrLst = ref<(string | number)[]>([]);
    protected _historyResultLst = ref([] as TDictViewVal[]);
    protected _historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.none;

    protected _lastFindRequestDate: number | null = null;
    protected _searchTimeout: any | null = null;
    protected _apiRequestTimeout = 1000;
    //testprop:Ref<any>;


    constructor(deps: Container, props: IFinderFormProps) {
        if (!t) t = useNuxtApp().$i18n.t;

        this._diC = deps;
        this._userCtx = this._diC.get<UserContext>('UserContext');
        this._searchStrStatistic = this._diC.get(FreqUsingStrStatistic);
        this._resultHistoryStatistic = this._diC.get(FreqUsingStrStatistic);

        this._loading.value = false;
        this._props = props;
        this._searchStrStatistic.init(this._props.finderDataProvider.getInstName() || "default");
        this._resultHistoryStatistic.init((this._props.finderDataProvider.getInstName() + "hist_res") || "default_hist_res");
        this._historyResultTypeStorage = props.historyResultTypeStorage || EFinderFormHistoryResultTypeStorage.none;
        this._apiRequestTimeout = props.apiRequestTimeout || 1000;
        this._searchedStrLst.value = this._searchStrStatistic.getMostFreq(100).map(val => val.value);
    }



    async setup(props: IFinderFormProps, ctx?) {
        this._ctx = ctx;

        ctx.expose(this.expose());

        onMounted(() => {
            nextTick((() => setTimeout(() => { this._searchFieldRef.value.focus(); }, 10)));
        });

        const histRes = this._resultHistoryStatistic.getMostFreq(20);
        this._historyResultLst.value = [];
        for (let i = 0; i < histRes.length; i++) {
            const title = histRes[i].title || await this.getTitleItemByVal(histRes[i].value);
            if (title)
                this._historyResultLst.value.push({ value: histRes[i].value, title: title })
        }
        // this.testprop=computed(()=>[{value: 1, title:"wsdd"},{value: 2, title:"dfgfg"}])
    }



    expose() {
        return {
            eventsHandler: (e, d) => { return this.eventsHandler(e, d) }
        }
    }



    async getTitleItemsByVals(vals: (string | number)[]) {
        return await this._props.finderDataProvider.getTitles(vals);
    }



    async getTitleItemByVal(val: string | number) {
        return await this._props.finderDataProvider.getTitle(val);
    }



    _onfindSingleExec = false;

    async getValueList() {
        return await this._props.finderDataProvider.getList(this._searchingText.value);
    }



    catalogShow() {
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
                                this.onSelect(res);
                            });
                        }
                    }
                    return true;
                }
            );
        }
    }


    async onFind() {
        if (this._onfindSingleExec)
            return;

        this._onfindSingleExec = true;
        try {
            if (this._searchingText.value) {
                let diff = this._lastFindRequestDate ? Date.now() - this._lastFindRequestDate : this._apiRequestTimeout;
                if (diff < this._apiRequestTimeout)
                    await sleep(this._apiRequestTimeout - diff);
                this._valueList.value = await this.getValueList();
                this._lastFindRequestDate = Date.now();
            }
            else
                this._valueList.value = null;
        }
        finally {
            this._onfindSingleExec = false;
        }
    }



    async onSelect(e: TDictViewVal[]) {
        if (this._searchingText.value)
            this._searchStrStatistic.addItem(this._searchingText.value);

        if (this._historyResultTypeStorage != EFinderFormHistoryResultTypeStorage.none)
            if (this._historyResultTypeStorage == EFinderFormHistoryResultTypeStorage.valOnly)
                e.forEach(val => this._resultHistoryStatistic.addItem(val.value));
            else
                e.forEach(val => this._resultHistoryStatistic.addItem(val.value, val.title));
        closeDialog(e[0]);
    }



    onSearchTextInput() {
        if (this._searchTimeout)
            clearTimeout(this._searchTimeout);

        this._searchTimeout = setTimeout(() => {
            this.onFind();
        }, 1000);
    }



    async onMostFreqChooseClear() {
        if (await useQU("Очистить список?")) {
            this._historyResultLst.value.length = 0;
            this._resultHistoryStatistic.clear();
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
                    if (this._searchFieldRef.value.focused)
                        this.onFind();
                }
                else
                    this._searchFieldRef.value.focus();
                return true;
        }
    }


    //https://github.com/vuejs/babel-plugin-jsx#installation
    //https://v3.ru.vuejs.org/ru/guide/render-function.html#jsx

    /**Список найденных значений */
    getResultListField() {
        return <v-card class="overflow-y-auto w-100" style="height:90%;">
            <v-list lines="one" density="compact" class="ma-0 pa-0" items={this._valueList.value}
                onUpdate:selected={(e) => { this.onSelect(this._valueList.value!.filter(item => item.value == e[0])) }}
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
                            <v-btn ripple={false} style={(this._historyResultLst.value.length == 0) ? "visibility:hidden;" : ""} icon="mdi-delete" variant="plain" color="primary"
                                onClick={() => this.onMostFreqChooseClear()} />
                        </v-row>
                }}
            </v-card-item>

            <v-list bg-color="tertiary" lines="one" density="compact" class="ma-0 pa-0" items={this._historyResultLst.value}
                onUpdate:selected={(e) => { this.onSelect(this._historyResultLst.value!.filter(item => item.value == e[0])) }}
            />
        </v-card>
    }



    getEmptyResultListField() {
        return undefined;
    }


    /**Основная строка поиска */
    getMainSearchField() {
        return <v-row class="flex-0-1 pt-1">
            <v-autocomplete ref={this._searchFieldRef} clearable label={this._props.label || ''}
                variant="underlined" density="compact" modelValue={this._searchingText.value}
                items={this._searchedStrLst.value}
                prepend-icon="mdi-magnify" auto-select-first="exact"
                autofocus
                onInput={() => this.onSearchTextInput()}
                //onUpdate:search={(val) => { if(val) this.ctx.emit("update:modelValue", val); }}
                //onUpdate:search={(val) => {  if (val) this.searchFieldRef.value.$emit("update:modelValue", val); }}
                onUpdate:search={(val) => { if (val) this._searchingText.value = val }}
                onUpdate:modelValue={(val => { this._searchingText.value = val; if (val) this.onFind(); else this._valueList.value = null })}
            >
                {{
                    "no-data": () => undefined
                }}
            </v-autocomplete>

            {
                this._props.selectFormComponent ?
                    <v-btn ripple={false} icon="mdi-view-list" variant="plain" color="primary"
                        onClick={() => this.catalogShow()} />
                    :
                    null
            }
        </v-row>
    }



    render() {
        return (createElement, context) =>
            <WindowDialog diC={this._diC} frameHeaderData={{ title: this._props.title }} width="700" height="85dvh" okTitle={null}>
                {this.getMainSearchField()}

                {
                    this._loading.value ?
                        <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                        :
                        (this._historyResultTypeStorage != EFinderFormHistoryResultTypeStorage.none && this._valueList.value == null) ?
                            this.getMostFreqChoose(90)
                            :
                            (this._valueList.value != null && this._valueList.value.length > 0) ? this.getResultListField() : this.getEmptyResultListField()
                }
            </WindowDialog>
    }
}