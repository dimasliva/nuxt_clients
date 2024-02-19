import { QueryParams } from "~/lib/MoApi/RequestArgs";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { UserContext } from "~/lib/UserContext";
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~~/libVis/Helpers';
import { DataList } from "~/lib/DataList";
import SimpleFilterForm from "~/components/forms/SimpleFilterForm";
import Navigator from "~/components/navigators/Navigator.vue";
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import type { INavPathItem, IСoncreteNavigatorProps, TNavRow } from "~/components/navigators/NavigatorTypes";
import type { Container } from "inversify";
import type { PageMemoryCacheStore } from "~/lib/Cache/PageMemoryCacheStore";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { EDataType } from "~/lib/globalTypes";
import { EEmployeeAppProfileSections } from "~/lib/EmployeeAppProfile";
import { ClientRecord } from "~/lib/MoApi/Records/ClientRecord";
import type { ProductsCatalogRecord } from "~/lib/MoApi/Records/ProductsCatalogRecord";


let t: any;

export interface IProductNavigatorTemplateProps {
    diC?: Container
}


type TFilterVals = {
    title: string;
}


export class ProductNavigatorTemplate {


    protected _diC: Container = null!;
    protected _MoApiClient: MoApiClient = null!;
    protected _UserContext: UserContext = null!;
    protected _RecordsStore: RecordsStore = null!;
    protected _PageCacheStore: PageMemoryCacheStore = null!;

    protected _FilterVals = ref({}) as Ref<TFilterVals>;
    protected _RefDataTable = ref();
    protected _RefFilterForm = ref();
    protected _Loading = ref(false);
    protected _productCatalogRecs = ref<ProductsCatalogRecord[]>();

    /*
        abstract modelEditDialog: any;
        abstract getWhereFromFilter(filterVals: TFilterVals): string;
        abstract convertRow(rawData): Promise<any>;
        abstract onUpdateModel(key, index?): boolean;
        abstract getApiData(queryParams: QueryParams): Promise<DataList>;
    */

    //Настрока формы фильтра
    protected _FilterSetting = {
        title: "Фильтр",

        getFields: () => {
            return {
                title: {
                    type: EDataType.string,
                    title: "Название товара или услуги",
                    hint: null,
                    rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа фамилии"],
                    constraints: { min: 2, max: 384 },
                }
            }
        },

        defaultFocus: "title",

        onFind: (inputData: any) => {
            return true;
        }
    };


    constructor() {
        if (!t) t = useNuxtApp().$i18n.t;
    }



    async setup(props: IProductNavigatorTemplateProps, ctx?) {

        const diC = this._diC = props.diC || useContainer();
        this._MoApiClient = diC.get("MoApiClient");
        this._UserContext = diC.get("UserContext");
        this._RecordsStore = diC.get("RecordsStore");
        this._PageCacheStore = diC.get("PageCacheStore");

        onMounted(() => {
            this._RefFilterForm.value.show();
            this.loadData();
        })
    }


    eventsHandler(e: string, d: any) {
        switch (e) {
            case "onKeydown":
                if (!this._Loading.value) {
                    if (this._RefDataTable.value) {
                        let inc = (d.key == 'ArrowLeft') ? -1 : (d.key == 'ArrowRight') ? 1 : 0;

                        if (inc != 0) {
                            if (this._RefFilterForm.value.isVisible())
                                this._RefFilterForm.value.blur();
                            this._RefDataTable.value.addCurrPage(inc);
                            break;
                        }
                    }

                    if (!this._RefFilterForm.value.isVisible() && d.keyCode >= 32) {
                        this._RefFilterForm.value.clear();
                        this._RefFilterForm.value.show()
                    }


                    if (this._RefFilterForm.value.isVisible() && (d.keyCode >= 32 || ['Enter', 'Delete', 'Backspace'].includes(d.key)))
                        return this._RefFilterForm.value.eventsHandler(e, d);

                }
                break;
        }
        return false;
    };



    updateData() {
        this.loadData();
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


    loadProductCatalogList(){

    }

    loadData() {
        /*
        vHelpers.action(async () => {
            this._Loading.value = true;
            let requestFields = ["id"].concat(this.getRequestFilterFields(this.dataTableDescr.value.headers, this.dataTableVars.value.columns));

            let where = "changedAt <= '3000-01-01'";
            let limit = 100;

            if (this._RefFilterForm.value.isFindable()) {
                limit = 0;
                where = this.getWhereFromFilter(this._FilterVals.value!)
            }

            this.dataTableVars.value.rows = await this.getData(requestFields.join(","), where, "changedAt desc", limit);
            vHelpers.chkMaxItemsLimit(this.dataTableVars.value.rows);

            if (this._RefDataTable.value)
                this._RefDataTable.value.reset();
        })
            .catch((exc) => {
                this.dataTableVars.value.rows.length = 0;
            })
            .finally(() => {
                this._Loading.value = false;
            });
            */
    }



    async getData(select: string, where: string, sortedBy: string, quantity: number) {
        /*
                const startTime = performance.now();
                let recArr = await this.getApiData(new QueryParams(select, where, sortedBy, quantity));
        
                const endTime = performance.now();
                console.debug(`rows count=${recArr.getLength()} for ${endTime - startTime} ms`);
        
                const res: any[] = [];
                let row: any | undefined;
        
                while (row = recArr.getNext())
                    res.push(await this.convertRow(row));
        
                return res;
                */
    }


    async add() {
        // openDialog(this.modelEditDialog, { recKey: null }, true, (e, d) => (e == "onBeforeClose") ? d ? this.onAddModel(d) : true : true)
    }


    async edit(key, index?) {
        //   openDialog(this.modelEditDialog, { recKey: key }, true, (e, d) => (e == "onBeforeClose") ? d ? this.onUpdateModel(d, index) : true : true)
    }


    saveSettings() {
        this._UserContext.EmployeeAppProfile!.setPropOfSection(EEmployeeAppProfileSections.ComponentSettings, "ProductNavigatorTemplate", {});
        this._UserContext.EmployeeAppProfile!.save();
    }



    async onNavigate(currlevel: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: TNavRow | null) {

        if (nextlevel <= 1)
            return {
                pathInfo: { key: "dfdf", title: "Прайсы", tag: "prices" } as INavPathItem,
                columns: [{ key: "comments", align: 'center', width: "400", sortable: true, title: "Комментарий" }],
                visibleCols: ["comments"],
                actionsMenu: {},
                rows: [
                    {
                        $mdata: {
                            isFolder: true,
                            tag: "price",
                        },
                        id: "we445",
                        title: "Прайс 1",
                        comments: "gggg"
                    },
                    {
                        $mdata: {
                            isFolder: true,
                            tag: "price",
                        },
                        id: "we44523",
                        title: "Прайс 2",
                        comments: "gggg"
                    },
                    {
                        $mdata: {
                            isFolder: false,
                            tag: "section",
                            getRowActionsMenu: () => { },
                        },
                        id: "we4453343",
                        title: "Общий анализ",
                        comments: "gggg"
                    }
                ]
            }
        else
            return {
                pathInfo: { key: "dfdf2", title: row?.title, tag: "price" } as INavPathItem,
                columns: [],
                visibleCols: [],
                actionsMenu: {},
                rows: [
                    {
                        $mdata: {
                            isFolder: false,
                            tag: "section",
                            getRowActionsMenu: () => { },
                        },
                        id: "we4453343345",
                        title: "Общий анализ мочи",
                        comment: "gggg"
                    },

                    {
                        $mdata: {
                            isFolder: false,
                            tag: "section",
                            getRowActionsMenu: () => { },
                        },
                        id: "324234",
                        title: "Общий анализ крови",
                        comment: "gggg"
                    }
                ]
            }

    }



    render() {

        return () => <div style="height: 100%;">
            <v-row class="ma-1 bg-background">
                <v-col class="w-50" style="min-width: 400; ">
                    {
                        (() => {
                            if (this._Loading.value == true)
                                return <v-card max-width="400" class="mx-auto" elevation="0" loading title="Идет загрузка..."></v-card>
                        })()
                    }
                    {
                        (() => {
                            const dt = <Navigator onNavigate={(level: number, nextlevel: number, currPath: readonly INavPathItem[], row: TNavRow) =>
                                this.onNavigate(level, nextlevel, currPath, row)} />;

                            //return h(KeepAlive, dt);
                            return dt;
                        })()
                    }
                </v-col>

                <v-expand-x-transition>
                    <SimpleFilterForm v-model={this._FilterVals} ref={this._RefFilterForm} filterSettings={this._FilterSetting} />
                </v-expand-x-transition>

            </v-row>
        </div>
    }

}