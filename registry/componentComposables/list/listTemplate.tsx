import { IDataTableDescription } from "componentComposables/dataTables/useDataTable";
import { QueryParams } from "~/lib/MoApi/RequestArgs";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { IPageData, PageMap } from "~/lib/PageMap";
import { UserContext } from "~/lib/UserContext";
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~~/libVis/Helpers';
import { DataList } from "lib/DataList";
import { NuxtApp, } from "nuxt/schema";
import SimpleFilterForm from "~/components/forms/SimpleFilterForm";
import { VRow } from "vuetify/lib/components/index.mjs";
import { h, KeepAlive, Teleport, Transition, TransitionGroup } from 'vue'
import DataTable from "~/components/DataTable.vue";


let t: any;

export abstract class ListTemplate<TFilterVals> {
    iocc = useContainer();
    userCtx = this.iocc.get<UserContext>('UserContext');
    pageMap = this.iocc.get<PageMap>("PageMap");
    recStore = this.iocc.get<RecordsStore>("RecordsStore");

    filterVals = ref({}) as Ref<TFilterVals>;
    refDataTable = ref();
    refFilterForm = ref();
    loading = ref(false);

    pageSettings: any;

    abstract PAGE_PATH: string;
    abstract defPageSettings: any;
    abstract dataTableDescr: Ref<IDataTableDescription>;
    abstract filterFieldSetting: any;
    abstract modelEditDialog: any;


    abstract getWhereFromFilter(filterVals: TFilterVals): string;
    abstract convertRow(rawData): any;
    abstract onUpdateModel(key, index?): boolean;
    abstract getApiData(queryParams: QueryParams): Promise<DataList>;



    dataTableVars = ref({
        itemsPerPage: 10,
        rows: [] as any[],
        page: 1,
        selected: [],
        columns: null as any
    });


    filterSetting: any;

    constructor() {
        if (!t) t = useNuxtApp().$i18n.t;
    }

    setPageData() {
        let pageMapData: IPageData = reactive({
            title: "Клиенты", icon: "",
            mainBtnBar: [
                {
                    id: "update", title: t("update"), icon: "mdi-autorenew", disabled: false, color: "secondary", bkgColor: "red",
                    action: () => this.updateData()
                },
                {
                    id: "addClient", title: t("add"), icon: "mdi-account", disabled: false, color: "secondary", bkgColor: "red",
                    action: () => this.add()
                },
                {
                    id: "filter", title: "", icon: "mdi-filter", disabled: false, color: "secondary", bkgColor: "red",
                    action: () => { this.refFilterForm.value.toggleVis() }
                },
            ]
        });

        this.pageMap.setPageData(this.PAGE_PATH, pageMapData);
    }



    setup() {
        this.setPageData();
        this.pageSettings = this.userCtx.EmployeeAppProfile?.getPageSettings(this.PAGE_PATH) || this.defPageSettings;
        this.dataTableVars.value.columns = this.pageSettings.tcols;

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


        onMounted(() => {
            this.refFilterForm.value.show();
            this.loadData();
        })

    }


    eventsHandler(e: string, d: any) {
        switch (e) {
            case "onKeydown":
                if (!this.loading.value) {
                    if (this.refDataTable.value) {
                        let inc = (d.key == 'ArrowLeft') ? -1 : (d.key == 'ArrowRight') ? 1 : 0;

                        if (inc != 0) {
                            if (this.refFilterForm.value.isVisible())
                                this.refFilterForm.value.blur();
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


    getRequestFilterFields(tableHeaders: any[], selColumns?: string[]) {
        let res: any[] = [];
        tableHeaders.forEach((item) => {
            if (!selColumns || selColumns.includes(item.key))
                if (Utils.chkRights(null, item.traits))
                    if (item.requestNames)
                        res = res.concat(item.requestNames);
        });
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
        let recArr = await this.getApiData(new QueryParams(select, where, sortedBy, quantity));

        const endTime = performance.now();
        console.debug(`clients count=${recArr.getLength()} for ${endTime - startTime} ms`);

        const res: any[] = [];
        let row: any | undefined;

        while (row = recArr.getNext())
            res.push(this.convertRow(row));

        return res;
    }


    async add() {
        openDialog(this.modelEditDialog, { recKey: null }, true, (e, d) => (e == "onBeforeClose") ? d ? this.onAddModel(d) : true : true)
    }


    async edit(key, index?) {
        openDialog(this.modelEditDialog, { recKey: key }, true, (e, d) => (e == "onBeforeClose") ? d ? this.onUpdateModel(d, index) : true : true)
    }


    saveSettings() {
        this.userCtx.EmployeeAppProfile?.setPageSettings(this.PAGE_PATH, this.pageSettings);
        this.userCtx.EmployeeAppProfile?.save();
    }

    render() {

        return () => <div  style="height: 100%;">
            <v-row class="ma-1 bg-background">
                <v-col class="w-50" style="min-width: 400; ">
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
                            const dt = <DataTable table-descr={this.dataTableDescr.value} visibility={this.loading.value == false && this.dataTableVars.value.rows.length > 0}
                                v-model:columns={this.dataTableVars.value.columns} //из-за этой строки не работает форматирование в vscode
                                ref={this.refDataTable} rows={this.dataTableVars.value.rows}
                                selected={this.dataTableVars.value.selected} onOnRowDblClick={(rowitem) => this.edit(rowitem.key, rowitem.index)}
                                onOnColumnsChanged={() => { this.loadData() }} onOnColumnsChangedDelayed={() => { this.saveSettings() }} />;

                            //return h(KeepAlive, dt);
                            return dt;
                        })()
                    }
                </v-col>

                <v-expand-x-transition>
                    <SimpleFilterForm v-model={this.filterVals} ref={this.refFilterForm} filterSettings={this.filterSetting} />
                </v-expand-x-transition>

            </v-row>
        </div>
    }
}