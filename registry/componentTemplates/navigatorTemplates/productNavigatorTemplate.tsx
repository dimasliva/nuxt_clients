import { QueryParams } from "~/lib/MoApi/RequestArgs";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { UserContext } from "~/lib/UserContext";
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~~/libVis/Helpers';
import { DataList } from "~/lib/DataList";
import SimpleFilterForm from "~/components/forms/SimpleFilterForm";
import Navigator from "~/components/navigators/Navigator.vue";
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import type { INavPathItem, INavigatorContent, IСoncreteNavigatorProps, INavRow } from "~/components/navigators/NavigatorTypes";
import type { Container } from "inversify";
import { EWellKnownPageCaches, type PageMemoryCacheStore } from "~/lib/Cache/PageMemoryCacheStore";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { EDataType } from "~/lib/globalTypes";
import { EEmployeeAppProfileSections } from "~/lib/EmployeeAppProfile";
import { ClientRecord } from "~/lib/MoApi/Records/ClientRecord";
import { ProductsCatalogRecord } from "~/lib/MoApi/Records/ProductsCatalogRecord";
import { ProductsApiSection } from "~/lib/MoApi/ApiSectionsV1/ProductsApiSection";
import { debug } from "console";
import type { ProductCatalogSectionCache } from "~/lib/Cache/ProductCatalogSectionCache";
import type { ProductCache } from "~/lib/Cache/ProductCache";
import   ProductProfileDialog  from "~/components/forms/ProductProfileDialog.vue";
import { ProductRecord } from "~/lib/MoApi/Records/ProductRecord";


let t: any;

export interface IProductNavigatorTemplateProps {
    diC?: Container
}


type TFilterVals = {
    title: string;
}


interface IProductNavRow extends INavRow {
    comments?: string | null | undefined;
    code?: string | null | undefined;
}



export class ProductNavigatorTemplate {


    protected _diC: Container = null!;
    protected _MoApiClient: MoApiClient = null!;
    protected _UserContext: UserContext = null!;
    protected _RecordsStore: RecordsStore = null!;
    protected _PageCacheStore: PageMemoryCacheStore = null!;
    protected _ProductsApiSection: ProductsApiSection = null!;

    protected _titleFilter = ref('');
    protected _RefNavigator = ref();
    protected _Loading = ref(false);
    protected _productCatalogRecs = ref<ProductsCatalogRecord[]>();

    /*
        abstract modelEditDialog: any;
        abstract getWhereFromFilter(filterVals: TFilterVals): string;
        abstract convertRow(rawData): Promise<any>;
        abstract onUpdateModel(key, index?): boolean;
        abstract getApiData(queryParams: QueryParams): Promise<DataList>;
    */


    constructor() {
        if (!t) t = useNuxtApp().$i18n.t;
    }



    async setup(props: IProductNavigatorTemplateProps, ctx?) {

        const diC = this._diC = props.diC || useSessionContainer();
        this._MoApiClient = diC.get("MoApiClient");
        this._UserContext = diC.get("UserContext");
        this._RecordsStore = diC.get("RecordsStore");
        this._PageCacheStore = diC.get("PageCacheStore");
        this._ProductsApiSection = diC.get(ProductsApiSection);

        await this.loadData();
    }


    eventsHandler(e: string, d: any) {
        switch (e) {
            case "onKeydown":
                if (!this._Loading.value) {
                    return this._RefNavigator.value.eventsHandler(e, d);
                }
                break;

                case "onBeforePageDeactivate":
                    return this._RefNavigator.value.eventsHandler(e, d);
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



    async loadProductCatalogList() {
        const ids = await vHelpers.action(() => this._ProductsApiSection.findProductsCatalogs(null));
        this._productCatalogRecs.value = await this._RecordsStore.getRecords(ProductsCatalogRecord, ids);
    }



    async loadData() {
        await this.loadProductCatalogList()
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



    async onUpdate() {

    }


    onUpdateProductModel(row: any, index?: number) {
        (async () => {
            if (row) {
              let rec = await this._RecordsStore.fetch(ProductRecord, row.id);
              row.title=rec.Data!.title;
              row.comments=rec.Data!.comments;
            }
          })();

        return true;
    }


    async onRowClick(level: number, currPathItem: INavPathItem, row: INavRow, index?: number) {
        openDialog(ProductProfileDialog, { diC: this._diC, recKey: row.id }, true, (e, key) => (e == "onBeforeClose") ? key ? this.onUpdateProductModel(row, index) : true : true)
    }



    async onNavigate(currlevel: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: INavRow | null) {

        if (nextlevel <= 1) {
            //каталоги товаров и услуг
            return {
                pathInfo: { key: "0", title: "Прайсы", tag: "catalogs" } as INavPathItem,
                columns: [{ key: "comments", align: 'center', width: "400", sortable: true, title: "Комментарий" },
                          { key: "code", align: 'center', width: "150", sortable: true, title: "Код" }],
                visibleCols: ["code","comments"],
                actionsMenu: [{
                    id: "addCatalog",
                    icon: "mdi-folder-plus",
                    title: "Добавить каталог",
                    action: internalRowItem => this.onUpdate()
                }],
                rows: this._productCatalogRecs.value?.map((prodCatRec) => {
                    return {
                        $mdata: {
                            isFolder: true,
                            tag: "catalog",
                        },
                        id: prodCatRec.Key,
                        title: prodCatRec.Data!.title,
                        comments: prodCatRec.Data!.comments || "",
                        code: prodCatRec.Data!.code || ""
                    }
                }) || []
            } as INavigatorContent
        }
        else {
            const sectCache = this._PageCacheStore.getWellKnownCache(EWellKnownPageCaches.ProductCatalogSections) as ProductCatalogSectionCache;
            const prodCache = this._PageCacheStore.getWellKnownCache(EWellKnownPageCaches.Products) as ProductCache;

            let pathInfo: INavPathItem;
            let nextId: string;

            if (row) {
                //переход в подкаталог в навигаторе
                nextId = row.id;
                if (row.$mdata.tag == "catalog") {
                    //переход в каталог товаров и услуг
                    pathInfo = {
                        key: row!.id,
                        title: (await this._RecordsStore.fetch(ProductsCatalogRecord, row!.id)).Data!.title,
                        tag: row.$mdata.tag
                    }
                }
                else {
                     //переход в раздел каталога товаров и услуг
                    pathInfo = {
                        key: row!.id,
                        title: (await sectCache.getOrCreate(row!.id)).title || "",
                        tag: row!.$mdata.tag
                    }
                }
            }
            else {
                //переход в вышестоящий каталог
                pathInfo = currPath![nextlevel - 1];
                nextId = pathInfo.key;
            }

            const res: INavigatorContent = {
                filterTitle: "Фильтр по наименованию товара или услуги",
                pathInfo,
                columns: [{ key: "comments", align: 'center', width: "400", sortable: true, title: "Комментарий" },
                          { key: "code", align: 'start', width: "150", sortable: true, title: "Код" }],
                visibleCols: ["code", "comments"],
                actionsMenu: [{
                    id: "addSection",
                    icon: "mdi-folder-plus",
                    title: "Добавить раздел",
                    action: internalRowItem => this.onUpdate()
                },
                {
                    id: "addProduct",
                    icon: "mdi-file-plus-outline",
                    title: "Добавить товар или услугу",
                    action: internalRowItem => this.onUpdate()
                },
                (selected)=>{
                    return {
                        id: "delSelProduct",
                        icon: "mdi-file-plus-outline",
                        title: "Удалить выбранное",
                        action: internalRowItem => this.onUpdate()
                    }
                }
                
            ],
                rows: [],
                onRowClick: (...args) => this.onRowClick(...args)
            }

            //сначала добавляются разделы каталолга
            const sectIter = await sectCache.getKeysIteratorInPage(nextId);

            if (sectIter)
                for (let item of sectIter) {
                    const sectData = await sectCache.getOrCreate(item);

                    const row: IProductNavRow =
                    {
                        $mdata: {
                            isFolder: true,
                            tag: "catalogSection",
                            getRowActionsMenu: () => [],
                        },
                        id: item,
                        title: sectData.title || "",
                        code: sectData.code || "",
                    }
                    res.rows.push(row);
                }

             // добавляются товары и услуги
            const prodIter = await prodCache.getKeysIteratorInPage(nextId);

            if (prodIter)
                for (let item of prodIter) {
                    const prodData = await prodCache.getOrCreate(item);

                    if (this._titleFilter.value && prodData.title && !prodData.title.toLowerCase().includes(this._titleFilter.value.toLowerCase()))
                        continue;

                    const row: IProductNavRow =
                    {
                        $mdata: {
                            isFolder: false,
                            tag: "product",
                            getRowActionsMenu: () => [],
                        },
                        id: item,
                        title: prodData.title || "",
                        comments: prodData.comments,
                        code: prodData.code || "",
                    }
                    res.rows.push(row);
                }
            return res;
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
                            const dt = <Navigator ref={this._RefNavigator} v-model:filterValue={this._titleFilter.value}
                                onNavigate={(level: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: INavRow | null) =>
                                    this.onNavigate(level, nextlevel, currPath, row)} />;

                            //return h(KeepAlive, dt);
                            return dt;
                        })()
                    }
                </v-col>
            </v-row>
        </div>
    }

}