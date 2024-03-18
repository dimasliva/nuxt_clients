import { QueryParams } from "~/lib/MoApi/RequestArgs";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import type { UserContext } from "~/lib/UserContext";
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
import { ProductsCatalogRecord, ProductsCatalogRecordData } from "~/lib/MoApi/Records/ProductsCatalogRecord";
import { ProductsApiSection } from "~/lib/MoApi/ApiSectionsV1/ProductsApiSection";
import type { ProductCatalogSectionCache } from "~/lib/Cache/ProductCatalogSectionCache";
import type { ProductCache } from "~/lib/Cache/ProductCache";
import   ProductProfileDialog  from "~/components/forms/ProductProfileDialog.vue";
import   ProductsCatalogSectionProfileDialog  from "~/components/forms/ProductsCatalogSectionProfileDialog.vue";
import   ProductsCatalogProfileDialog  from "~/components/forms/ProductsCatalogProfileDialog.vue";
import { ProductRecord, ProductRecordData } from "~/lib/MoApi/Records/ProductRecord";
import { ProductsCatalogSectionRecord, ProductsCatalogSectionRecordData } from "~/lib/MoApi/Records/ProductsCatalogSectionRecord";


let t: any;

export interface IProductNavigatorTemplateProps {
    diC?: Container
}


type TFilterVals = {
    title: string;
}


type TPathTag= {
    type: string;
    catalogKey: string | null;
    catalogSectionKey: string | null;
}

interface IProductNavRow extends INavRow {
    comments?: string | null | undefined;
    code?: string | null | undefined;
}


interface IProductNavigatorSettings{
    visibleCols?:string[];
    visibleColsCat?:string[];
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
    protected _productCatalogRecs = ref<ProductsCatalogRecord[] | null>();
    protected _visibleCols: string[] = [];
    protected _visibleColsCat: string[] = [];

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

        await this.loadSettings();
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
        const ids = await vHelpers.action(() => this._ProductsApiSection.findProductsCatalogs("notActive is not true"));
        this._productCatalogRecs.value = await this._RecordsStore.getRecords(ProductsCatalogRecord, ids);
    }



    async addProduct(catalogKey: string | null, catalogSectionKey: string | null) {
        const newrec = await this._RecordsStore.createNew(ProductRecord, (data: ProductRecordData) => {
            data.productsCatalog = catalogKey!;
            data.productsCatalogSection = catalogSectionKey;
        });

        openDialog(ProductProfileDialog, { recKey: null, rec: newrec}, true,
            (e, d) => {
                if (e == "onBeforeClose" && d) {
                    this._RefNavigator.value.update();
                    this._RefNavigator.value.setSelectedLine(d);
                }
                return true;
            });
    }



    async editProduct(row:IProductNavRow, index?) {
        openDialog(ProductProfileDialog, { diC: this._diC, recKey: row.id }, true, (e, key) => (e == "onBeforeClose") ? key ? this.updateProductRow(row, index) : true : true)
    }



    updateProductRow(row: any, index?: number) {
        (async () => {
            if (row) {
              let rec = await this._RecordsStore.fetch(ProductRecord, row.id);
              row.title=rec.Data!.title;
              row.comments=rec.Data!.comments;
              row.code=rec.Data!.code;
            }
          })();

        return true;
    }



    async delProduct(row: any, index?: number) {
        
        if (await useQU("Удалить?"))
            if (row) {
                let rec = await this._RecordsStore.fetch(ProductRecord, row.id);
                rec.MData!.notActive = true;
                await rec.save();
                this._RefNavigator.value.update();
            }
    }



    async addProductsCatalogSection(catalogKey: string | null, catalogSectionKey: string | null) {
        const newrec = await this._RecordsStore.createNew(ProductsCatalogSectionRecord, (data: ProductsCatalogSectionRecordData) => {
            data.productsCatalog = catalogKey!;
            data.parent = catalogSectionKey;
        });

        openDialog(ProductsCatalogSectionProfileDialog, { recKey: null, rec: newrec}, true,
            (e, d) => {
                if (e == "onBeforeClose" && d) {
                    this._RefNavigator.value.update();
                    this._RefNavigator.value.setSelectedLine(d);
                }
                return true;
            });
    }



    async editProductsCatalogSection(row:IProductNavRow, index?){
        openDialog(ProductsCatalogSectionProfileDialog, { diC: this._diC, recKey: row.id }, true, (e, key) => (e == "onBeforeClose") ? key ? this.updateProductsCatalogSectionRow(row, index) : true : true)
    }



    updateProductsCatalogSectionRow(row: any, index?: number) {
        (async () => {
            if (row) {
              let rec = await this._RecordsStore.fetch(ProductsCatalogSectionRecord, row.id);
              row.title=rec.Data!.title;
              row.comments=rec.Data!.comments;
              row.code=rec.Data!.code;
            }
          })();

        return true;
    }



    async delProductsCatalogSection(row: any, index?: number) {
        
        if (await useQU("Удалить раздел?"))
            if (row) {
                let rec = await this._RecordsStore.fetch(ProductsCatalogSectionRecord, row.id);
                rec.MData!.notActive = true;
                await rec.save();
                this._RefNavigator.value.update();
            }
    }
    


    async addProductsCatalog() {
        openDialog(ProductsCatalogProfileDialog, { recKey: null }, true,
            (e, d) => {
                if (e == "onBeforeClose" && d) {
                    this._productCatalogRecs.value=null;
                    this._RefNavigator.value.update();
                    this._RefNavigator.value.setSelectedLine(d);
                }
                return true;
            });
    }


    async editProductsCatalog(row:IProductNavRow, index?){
        openDialog(ProductsCatalogProfileDialog, { diC: this._diC, recKey: row.id }, true, (e, key) => (e == "onBeforeClose") ? key ? this.updateProductsCatalogRow(row, index) : true : true)
    }



    updateProductsCatalogRow(row: any, index?: number) {
        (async () => {
            if (row) {
              let rec = await this._RecordsStore.fetch(ProductsCatalogRecord, row.id);
              row.title=rec.Data!.title;
              row.comments=rec.Data!.comments;
              row.code=rec.Data!.code;
            }
          })();

        return true;
    }



    async delProductsCatalog(row: any, index?: number) {
        
        if (await useQU("Удалить каталог?"))
            if (row) {
                let rec = await this._RecordsStore.fetch(ProductsCatalogRecord, row.id);
                rec.MData!.notActive = true;
                await rec.save();
                const inx=this._productCatalogRecs.value!.findIndex(item=>item.Key==rec.Key);
                this._productCatalogRecs.value!.splice(inx,1);
                this._RefNavigator.value.update();
            }
    }



    async onRowClick(level: number, currPathItem: INavPathItem, row: INavRow, index?: number) {
        this.editProduct(row,index);
    }



    onVisibleColsChanged(name:string, visCols:string[]){
        const sts=this._UserContext.EmployeeAppProfile!.getPropOfSection<IProductNavigatorSettings>(EEmployeeAppProfileSections.ComponentSettings, "ProductNav")||{};

        if(name=="cat")
            sts.visibleColsCat=visCols;
        else
            sts.visibleCols=visCols;

        this._UserContext.EmployeeAppProfile!.setPropOfSection(EEmployeeAppProfileSections.ComponentSettings, "ProductNav",sts);
        this._UserContext.EmployeeAppProfile?.save();
    }



    async loadSettings(){
        const sts=await this._UserContext.EmployeeAppProfile?.getPropOfSection<IProductNavigatorSettings>(EEmployeeAppProfileSections.ComponentSettings, "ProductNav")||{};
        this._visibleCols=sts.visibleCols || ["code","comments"];
        this._visibleColsCat=sts.visibleColsCat || ["code","comments"];
    }



    async onUpdateData(path: readonly INavPathItem[]) {
        const sectCache = this._PageCacheStore.getWellKnownCache(EWellKnownPageCaches.ProductCatalogSections) as ProductCatalogSectionCache;
        const prodCache = this._PageCacheStore.getWellKnownCache(EWellKnownPageCaches.Products) as ProductCache;

        sectCache.clear();
        prodCache.clear();
        this._productCatalogRecs.value=null;
    }



    async onNavigate(currlevel: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: INavRow | null) {

        if (nextlevel <= 1) {
            //каталоги товаров и услуг

            if (!this._productCatalogRecs.value)
                await this.loadProductCatalogList();

            const pathtag: TPathTag = { type: "catalogs", catalogKey: null, catalogSectionKey: null };

            return {
                pathInfo: { key: "0", title: "Каталоги", tag: pathtag } as INavPathItem,
                columns: [{ key: "comments", align: 'center', width: "400", sortable: true, title: "Комментарий" },
                { key: "code", align: 'center', width: "150", sortable: true, title: "Код" }],
                visibleCols: this._visibleColsCat,
                onVisibleColsChanged: (v) => this.onVisibleColsChanged("cat", v),
                onUpdate: path=>this.onUpdateData(path),
                actionsMenu: [{
                    id: "addCatalog",
                    icon: "mdi-folder-plus",
                    title: "Добавить каталог",
                    action: (path, selected) => this.addProductsCatalog()
                }],
                rows: this._productCatalogRecs.value?.map((prodCatRec) => {
                    return {
                        $mdata: {
                            isFolder: true,
                            tag: "catalog",
                            getRowActionsMenu: (row) => [
                                {
                                    id: "editCatalog",
                                    title: "Редактировать",
                                    icon:"mdi-folder-edit",
                                    action: (row)=>this.editProductsCatalog(row.raw)
                                },
                                {
                                    id: "delCatalog",
                                    title: "Удалить",
                                    icon:"mdi-delete",
                                    action: (row)=>this.delProductsCatalog(row.raw)
                                }
                            ]
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

                    const pathtag: TPathTag = { type: row.$mdata.tag, catalogKey: row!.id, catalogSectionKey: null };
                    pathInfo = {
                        key: row!.id,
                        title: (await this._RecordsStore.fetch(ProductsCatalogRecord, row!.id)).Data!.title,
                        tag: pathtag
                    }
                }
                else {
                    //переход в раздел каталога товаров и услуг

                    const pathtag: TPathTag = { type: row.$mdata.tag, catalogKey: currPath![currPath!.length - 1].tag.catalogKey, catalogSectionKey: row!.id };
                    pathInfo = {
                        key: row!.id,
                        title: (await sectCache.getOrCreate(row!.id)).title || "",
                        tag: pathtag
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
                visibleCols: this._visibleCols,
                onVisibleColsChanged: (v) => this.onVisibleColsChanged("sect", v),
                onUpdate: path=>this.onUpdateData(path),
                actionsMenu: [{
                    id: "addSection",
                    icon: "mdi-folder-plus",
                    title: "Добавить раздел",
                    action: (path, selected) => {
                        const tag = path[path.length - 1].tag;
                        return this.addProductsCatalogSection(tag.catalogKey, tag.catalogSectionKey)
                    }
                },

                {
                    id: "addProduct",
                    icon: "mdi-file-plus-outline",
                    title: "Добавить товар или услугу",
                    action: (path, selected) => {
                        const tag = path[path.length - 1].tag;
                        return this.addProduct(tag.catalogKey, tag.catalogSectionKey)
                    }
                },
/*
                (selected) => {
                    return {
                        id: "delSelProduct",
                        icon: "mdi-file-plus-outline",
                        title: "Удалить выбранное",
                        action: selected => this.onUpdate()
                    }
                }*/

                ],
                rows: [],
                onRowClick: (...args) => this.onRowClick(...args)
            }

            //сначала добавляются разделы каталога
            const sectIter = await sectCache.getKeysIteratorInPage(nextId);

            if (sectIter)
                for (let item of sectIter) {
                    const sectData = await sectCache.getOrCreate(item);

                    const row: IProductNavRow =
                    {
                        $mdata: {
                            isFolder: true,
                            tag: "catalogSection",
                            getRowActionsMenu: (row) => [
                                {
                                    id: "editCatalogSection",
                                    title: "Редактировать",
                                    icon:"mdi-folder-edit",
                                    action: (row)=>this.editProductsCatalogSection(row.raw)
                                },
                                {
                                    id: "delCatalogSection",
                                    title: "Удалить",
                                    icon:"mdi-delete",
                                    action: (row)=>this.delProductsCatalogSection(row.raw)
                                }
                            ],
                        },
                        id: item,
                        title: sectData.title || "",
                        comments: sectData.comments||"",
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
                            getRowActionsMenu: () => [
                                {
                                    id: "editProduct",
                                    title: "Редактировать",
                                    icon:"mdi-file-edit",
                                    action: (row)=>this.editProduct(row.raw)
                                },
                                {
                                    id: "delProduct",
                                    title: "Удалить",
                                    icon:"mdi-delete",
                                    action: (row)=>this.delProduct(row.raw)
                                }
                            ],
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