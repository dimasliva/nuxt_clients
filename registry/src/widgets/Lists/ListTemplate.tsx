import { Container, inject, injectable } from 'inversify';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription } from "~widgets/DataTables";
import { QueryParams } from "~/src/common/lib/MoApi/RequestArgs";
import { RecordsStore } from "~/src/common/lib/MoApi/Records/RecordsStore";
import { type IFrameHeaderData, PageMap } from "~/src/common/lib/PageMap";
import * as Utils from '~/src/common/lib/Utils';
import * as vHelpers from '~uilib/Helpers';
import { DataList } from "~/src/common/lib/DataList";
import SimpleFilterForm from "~forms/SimpleFilterForm";
import  DataTable  from "~widgets/DataTables//DataTable.vue";
import type { ApiRecord } from "~/src/common/lib/MoApi/Records/ApiRecord";
import type { IRenderedTemplateComponent, IRenderedTemplateComponentProps } from "~components/types";
import type { SetupContext } from 'vue';
import type { TDictViewVal } from '~/src/ui_tools/FinderDataProviders/FinderDataProvider';


let t: any;

export interface IListTemplateProps extends IRenderedTemplateComponentProps {
    selectStrategy?: 'page' | 'single' | 'all'
    selectableTypes?: string[];
    selectMode?: boolean,
    choosedValues?: TDictViewVal[]
}


export abstract class ListTemplate<TFilterVals> implements IRenderedTemplateComponent {

    protected _diC: Container = null!;
    protected _recStore: RecordsStore = null!;

    props: IListTemplateProps = {};
    filterVals = ref({}) as Ref<TFilterVals>;
    refDataTable = ref();
    refFilterForm = ref();
    loading = ref(false);

    pageSettings: any;

    abstract PAGE_TITLE: string;
    abstract defPageSettings: any;
    abstract dataTableDescr: Ref<IDataTableDescription>;
    abstract filterFieldSetting: any;
    abstract modelEditDialog: any;
    abstract titleColName: string;

    abstract getWhereFromFilter(filterVals: TFilterVals): string;
    abstract convertRow(rawData): Promise<any>;
    abstract onUpdateModel(key, index?): boolean;
    abstract getApiData(queryParams: QueryParams): Promise<DataList>;


    constructor(diC?: Container, opts?: IListTemplateProps | null) {

        this._diC = diC || useSessionContainer();

        if (!t) t = useNuxtApp().$i18n.t;
        this._recStore = this._diC.get("RecordsStore");

        this.props = opts || {};
        this.dataTableVars.value.selectStrategy = this.props.selectStrategy;
        this.dataTableVars.value.selected = this.props.choosedValues || [];
    }


    dataTableVars = ref({
        itemsPerPage: 10,
        rows: reactive([]) as any[],
        page: 1,
        selected: [] as TDictViewVal[],
        columns: [] as Array<string>,
        selectStrategy: this.props?.selectStrategy,
    });


    filterSetting: any;


    getFrameHeaderData() {

        const btns = [] as IBtnMenu[];

        btns.push({
            id: "update", title: t("update"), icon: "mdi-autorenew", disabled: false, color: "primary", bkgColor: "blue",
            action: () => this.updateData()
        });

        if (!this.props?.selectMode) {
            btns.push({
                id: "addClient", title: t("add"), icon: "mdi-account", disabled: false, color: "primary", bkgColor: "red",
                action: () => this.add()
            });
        }

        btns.push({
            id: "filter", title: "", icon: "mdi-magnify", disabled: false, color: "primary", bkgColor: "red",
            action: () => { this.refFilterForm.value.toggleVis() }
        });


        let pageMapData: IFrameHeaderData = reactive({
            title: this.PAGE_TITLE, icon: "",
            mainBtnBar: btns
        });

        return pageMapData;
    }



    async setup(props: IListTemplateProps, ctx: SetupContext) {
        this.pageSettings = this.props.settingsStorage?.getData() || this.defPageSettings;
        this.dataTableVars.value.columns = this.pageSettings.tcols;
        this.props.choosedValues = props.choosedValues;
        this.dataTableVars.value.selected = props.choosedValues || [];

        this.filterSetting = {
            getFields: () => this.filterFieldSetting.fields,
            defaultFocus: this.filterFieldSetting.defaultFocus,
            onFind: (inputData: any) => {
                if (!this.loading.value) {
                    this.filterVals.value = inputData;

                    this.loadData();
                }
                return true;
            }
        }

        ctx.expose(this.expose());

        onMounted(() => {
            this.refFilterForm.value.show();
            this.loadData();
        })
    }



    sprops() {
        return ["choosedValues"];
    }



    expose() {
        return {
            eventsHandler: (e, d) => this.eventsHandler(e, d),
            getSelected: () => this.getSelected()
        }
    }



    eventsHandler(e: string, d: any) {
        switch (e) {
            case "onKeydown":
                if (!this.loading.value) {
                    if (this.refDataTable.value) {
                        let inc = (d.key == 'ArrowLeft') ? -1 : (d.key == 'ArrowRight') ? 1 : 0;

                        if (inc != 0) {
                            if (!this.refFilterForm.value.isFocused())
                                this.refDataTable.value.addCurrPage(inc);
                            break;
                        }
                    }

                    if (!this.refFilterForm.value.isVisible() && d.keyCode >= 32) {
                        this.refFilterForm.value.clear();
                        this.refFilterForm.value.show()
                    }


                    if (this.refFilterForm.value.isVisible() && (d.keyCode >= 32 || ['Enter', 'Delete', 'Backspace'].includes(d.key)))
                        return this.refFilterForm.value.eventsHandler(e, d);

                }
                break;

            case "onPageActivate":
                //d==RouteLocationNormalizedLoaded
                break;

        }
        return false;
    };



    updateData() {
        this.loadData();
    }


    onAddModel(key) {
        if (key && !this.refFilterForm.value.isFindable())
            this.loadData();
        return true;
    }



    protected async _onDelModel(qustr: string, type: Class<ApiRecord>, key: string, index) {
        let res = await useDelQU(qustr);
        if (res) {
            let rec = await this._recStore.fetch(type, key);
            vHelpers.action(() => rec.delete())
                .then(() => this.dataTableVars.value.rows.splice(index, 1));
        }
    }


    getAdvRequestFields(selColumns?: string[]) { return [] as string[]; }


    getRequestFilterFields(tableHeaders: any[], selColumns?: string[]) {
        let res: any[] = [];
        tableHeaders.forEach((item) => {
            if (!selColumns || selColumns.includes(item.key))
                if (Utils.chkRights(null, item.traits))
                    if (item.requestNames)
                        res = res.concat(item.requestNames);
        });
        res = res.concat(this.getAdvRequestFields(selColumns));
        return res;
    }



    loadData() {
        vHelpers.action(async () => {
            this.loading.value = true;
            let requestFields = ["id"].concat(this.getRequestFilterFields(this.dataTableDescr.value.headers, this.dataTableVars.value.columns));

            let where = "changedAt <= '3000-01-01'";
            let limit = 100;

            if (this.refFilterForm.value.isFindable()) {
                limit = 0;
                where = this.getWhereFromFilter(this.filterVals.value!)
            }

            this.dataTableVars.value.rows = await this.getData(requestFields.join(","), where, "changedAt desc", limit);
            vHelpers.chkMaxItemsLimit(this.dataTableVars.value.rows);

            if (this.refDataTable.value)
                this.refDataTable.value.reset();
        })
            .catch((exc) => {
                this.dataTableVars.value.rows.length = 0;
            })
            .finally(() => {
                this.loading.value = false;
            });
    }



    async getData(select: string, where: string, sortedBy: string, quantity: number) {

        const startTime = performance.now();
        let recArr = await this.getApiData(new QueryParams(select, where, sortedBy, undefined, quantity));

        const endTime = performance.now();
        console.debug(`rows count=${recArr.getLength()} for ${endTime - startTime} ms`);

        const res: any[] = [];
        let row: any | undefined;

        while (row = recArr.getNext())
            res.push(await this.convertRow(row));

        return res;
    }


    async add() {
        if (!this.props?.selectMode)
            openDialog(this.modelEditDialog, { recKey: null }, true, true, (e, d) => (e == "onBeforeClose") ? d ? this.onAddModel(d) : true : true)
    }


    async edit(key, index?) {
        openDialog(
            this.modelEditDialog,
            { diC: this._diC, recKey: key, readonly: this.props?.selectMode },
            true,
            true,
            (e, d) => (e == "onBeforeClose") ? d ? this.onUpdateModel(d, index) : true : true)
    }


    saveSettings() {

        if (this.props?.settingsStorage) {
            this.props.settingsStorage.setData(this.pageSettings);
            this.props.settingsStorage.flush();
        }
    }


    getSelected() {
        return this.refDataTable.value.getSelected();
    }


    render() {
        return () => <v-row class="ma-1 h-100 bg-background">
            <v-col class="w-50 h-100 pt-0 pb-0" style="min-width: 400;">
                {
                    (() => {
                        if (this.loading.value == true)
                            return <v-card max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка..."></v-card>
                        else
                            if (this.dataTableVars.value.rows.length == 0 && this.loading.value == false)
                                return <v-card max-width="400" class="mx-auto" elevation="0">
                                    <v-card-text class="text-h6">Ничего не найдено, попробуйте изменить условия поиска</v-card-text>
                                    <img src="/cat-laptop-notfound.jpg" alt="cat with laptop" class="w-50 d-inline mx-auto" />
                                </v-card>
                    })()
                }
                {
                    (() => {
                        const dt = <DataTable
                            tableDescr={this.dataTableDescr.value}
                            visibility={this.loading.value == false && this.dataTableVars.value.rows.length > 0}
                            columns={this.dataTableVars.value.columns} //из-за этой строки не работает форматирование в vscode
                            ref={this.refDataTable}
                            rows={this.dataTableVars.value.rows}
                            selected={this.dataTableVars.value.selected}
                            selectStrategy={this.dataTableVars.value.selectStrategy}
                            titleColName={this.titleColName}
                            onOnRowDblClick={(rowitem) => this.edit(rowitem.key, rowitem.index)}
                            onOnColumnsChanged={() => { this.loadData() }}
                            onOnColumnsChangedDelayed={() => { this.saveSettings() }}

                        />;

                        //return h(KeepAlive, dt);
                        return dt;
                    })()
                }
            </v-col>

            <v-expand-x-transition>
                <SimpleFilterForm v-model={this.filterVals} ref={this.refFilterForm} filterSettings={this.filterSetting} />
            </v-expand-x-transition>

        </v-row>

    }
}