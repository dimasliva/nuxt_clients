
import type { RecordsStore } from "~/src/common/lib/MoApi/Records/RecordsStore";
import type { UserContext } from "~/src/common/lib/UserContext";
import * as Utils from '~/src/common/lib/Utils';
import * as vHelpers from '~uilib/Helpers';
import Navigator from "../Navigator.vue";
import type { INavPathItem, INavigatorContent, IСoncreteNavigatorProps, INavRow } from "~/src/widgets/Navigators/types";
import { Container } from "inversify";
import { EWellKnownPageCaches, type PageMemoryCacheStore } from "~/src/common/lib/Cache/PageMemoryCacheStore";
import type { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import { ProductsCatalogRecord, ProductsCatalogRecordData } from "~/src/common/lib/MoApi/Records/ProductsCatalogRecord";
import { ProductsApiSection } from "~/src/common/lib/MoApi/ApiSectionsV1/ProductsApiSection";
import type { ProductCatalogSectionCache } from "~/src/common/lib/Cache/ProductCatalogSectionCache";
import type { ProductCache } from "~/src/common/lib/Cache/ProductCache";
import   ProductProfileDialog  from "~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/ProfileDialogs/ProductProfileDialog.vue";
import   ProductsCatalogSectionProfileDialog  from "~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/ProfileDialogs/ProductsCatalogSectionProfileDialog.vue";
import   ProductsCatalogProfileDialog  from "~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/ProfileDialogs/ProductsCatalogProfileDialog.vue";
import { ProductRecord, ProductRecordData } from "~/src/common/lib/MoApi/Records/ProductRecord";
import { ProductsCatalogSectionRecord, ProductsCatalogSectionRecordData } from "~/src/common/lib/MoApi/Records/ProductsCatalogSectionRecord";
import type { IRenderedTemplateComponent, IRenderedTemplateComponentProps } from "~components/types";
import type { SetupContext } from "vue";
import type { IListTemplateProps } from "~/src/widgets/Lists/ListTemplate";
import { ProductFinderDataProvider } from "~uilib/FinderDataProviders/ProductFinderDataProvider";
import { useQU } from "~/src/forms";


let t: any;

export interface IProductNavigatorTemplateProps extends IListTemplateProps {
    selectableTypes?: ("catalog" | "catalogSection" | "product")[]
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

function dep(token: string | Object) {
    return (obj, key) => {
        const ctor = obj.constructor;
        if (!ctor.$deps)
            ctor.$deps = {} as any;
        ctor.$deps[key] = token;
    }
}


export class ProductNavigatorTemplate implements IRenderedTemplateComponent {

    protected _diC: Container = null!;
    protected _props: IProductNavigatorTemplateProps | null | undefined = null;

    @dep(ProductsApiSection)
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


    constructor(diC : Container, deps?: Object | null, props?: IProductNavigatorTemplateProps | null) {
        if (!t) t = useNuxtApp().$i18n.t;
        this._diC=diC;
        if (!deps) {
            this._MoApiClient = diC.get("MoApiClient");
            this._UserContext = diC.get("UserContext");
            this._RecordsStore = diC.get("RecordsStore");
            this._PageCacheStore = diC.get("PageCacheStore");
            this._ProductsApiSection = diC.get(ProductsApiSection);
        }
        else {
            this._MoApiClient = deps["MoApiClient"];
            this._UserContext = deps["UserContext"];
            this._RecordsStore = deps["RecordsStore"];
            this._PageCacheStore = deps["PageCacheStore"];
            this._ProductsApiSection = deps["ProductsApiSection"];
        }

        this._props=props;
    }



    async setup(props, ctx: SetupContext) {
        ctx?.expose(this.expose());
        await this.loadSettings();
    }



    expose() {
        return  { 
            eventsHandler: (e, d) => this.eventsHandler(e, d), 
            getSelected: ()=>this.getSelected() 
        }
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



    getFrameHeaderData() {
        return { title: "Товары и услуги" }
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
        const ids = await vHelpers.action(() => this._ProductsApiSection.findProductsCatalogs("notActive is not true"));
        this._productCatalogRecs.value = await this._RecordsStore.getRecords(ProductsCatalogRecord, ids);
    }



    async addProduct(catalogKey: string | null, catalogSectionKey: string | null) {
        const newrec = await this._RecordsStore.createNew(ProductRecord, (data: ProductRecordData) => {
            data.productsCatalog = catalogKey!;
            data.productsCatalogSection = catalogSectionKey;
        });

        openDialog(ProductProfileDialog, { recKey: null, rec: newrec}, true, true,
            (e, d) => {
                if (e == "onBeforeClose" && d) {
                    this._RefNavigator.value.update();
                    this._RefNavigator.value.setSelectedLine(d);
                }
                return true;
            });
    }



    async editProduct(row: IProductNavRow, index?) {
        openDialog(ProductProfileDialog, { diC: this._diC, recKey: row.id, readonly: this._props?.selectMode }, true, true, (e, key) => (e == "onBeforeClose") ? key ? this.updateProductRow(row, index) : true : true)
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

        openDialog(ProductsCatalogSectionProfileDialog, { recKey: null, rec: newrec}, true, true,
            (e, d) => {
                if (e == "onBeforeClose" && d) {
                    this._RefNavigator.value.update();
                    this._RefNavigator.value.setSelectedLine(d);
                }
                return true;
            });
    }



    async editProductsCatalogSection(row:IProductNavRow, index?){
        openDialog(
            ProductsCatalogSectionProfileDialog, 
            { diC: this._diC, recKey: row.id }, 
            true, 
            true, 
            (e, key) => (e == "onBeforeClose") ? key ? this.updateProductsCatalogSectionRow(row, index) : true : true
        );
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
        openDialog(ProductsCatalogProfileDialog, { recKey: null }, true, true,
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
        openDialog(
            ProductsCatalogProfileDialog,
            { diC: this._diC, recKey: row.id }, 
            true, 
            true,
            (e, key) => (e == "onBeforeClose") ? key ? this.updateProductsCatalogRow(row, index) : true : true
        );
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



    onVisibleColsChanged(name: string, visCols: string[]) {
        const sts = this._props?.settingsStorage?.getData() || {};

        if (name == "cat")
            sts.visibleColsCat = visCols;
        else
            sts.visibleCols = visCols;

        if (this._props?.settingsStorage) {
            this._props.settingsStorage.setData(sts);
            this._props.settingsStorage.flush();
        }
        // this._UserContext.EmployeeAppProfile!.setPropOfSection(EEmployeeAppProfileSections.ComponentSettings, "ProductNav",sts);
        // this._UserContext.EmployeeAppProfile?.save();
    }



    async loadSettings(){
        const sts=this._props?.settingsStorage?.getData() || {};
       // const sts=await this._UserContext.EmployeeAppProfile?.getPropOfSection<IProductNavigatorSettings>(EEmployeeAppProfileSections.ComponentSettings, "ProductNav")||{};
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

        const readonlymode=this._props?.selectMode;

        let productSelectable=true, catalogSectionSelectable=true, catalogSelectable=true;

        if(this._props?.selectMode && this._props.selectableTypes){
           productSelectable =  this._props.selectableTypes.includes("product");
           catalogSectionSelectable =  this._props.selectableTypes.includes("catalogSection");
           catalogSelectable =  this._props.selectableTypes.includes("catalog");
        }
 
        if (nextlevel <= 1) {
            //каталоги товаров и услуг

            if (!this._productCatalogRecs.value)
                await this.loadProductCatalogList();

            const pathtag: TPathTag = { type: "catalogs", catalogKey: null, catalogSectionKey: null };

            const res: INavigatorContent = {
                filterTitle: "Фильтр по наименованию каталога",
                pathInfo: { key: "0", title: "Каталоги", tag: pathtag } as INavPathItem,
                columns: [{ key: "comments", align: 'center', width: "400", sortable: true, title: "Комментарий" },
                { key: "code", align: 'center', width: "150", sortable: true, title: "Код" }],
                visibleCols: this._visibleColsCat,
                onVisibleColsChanged: (v) => this.onVisibleColsChanged("cat", v),
                onUpdate: path=>this.onUpdateData(path),
                actionsMenu: readonlymode? undefined : [{
                    id: "addCatalog",
                    icon: "mdi-folder-plus",
                    title: "Добавить каталог",
                    action: (path, selected) => this.addProductsCatalog()
                }],
                rows: [],
                finderDataProvider: this._diC.get(ProductFinderDataProvider).init("product_navigator",false,undefined,undefined,null)
            }

            this._productCatalogRecs.value?.forEach((prodCatRec) => {

                if (this._titleFilter.value && prodCatRec.Data?.title && !prodCatRec.Data?.title.toLowerCase().includes(this._titleFilter.value.toLowerCase()))
                    return;

                res.rows.push(
                    {
                        $mdata: {
                            isFolder: true,
                            tag: "catalog",
                            getRowActionsMenu:  readonlymode? undefined : (row) => [
                                {
                                    id: "editCatalog",
                                    title: "Редактировать",
                                    icon: "mdi-folder-edit",
                                    action: (row) => this.editProductsCatalog(row.raw)
                                },
                                {
                                    id: "delCatalog",
                                    title: "Удалить",
                                    icon: "mdi-delete",
                                    action: (row) => this.delProductsCatalog(row.raw)
                                }
                            ]
                        },
                        id: prodCatRec.Key,
                        title: prodCatRec.Data!.title,
                        comments: prodCatRec.Data!.comments || "",
                        code: prodCatRec.Data!.code || "",
                        $isSelectable: catalogSelectable
                    } as IProductNavRow);
            });
            return res;
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
                actionsMenu:  readonlymode? undefined : [{
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
                onRowClick: (...args) => this.onRowClick(...args),
                finderDataProvider: this._diC.get(ProductFinderDataProvider).init("product_navigator",false,undefined,undefined,null)
            }

            //сначала добавляются разделы каталога
            const sectIter = await sectCache.getKeysIteratorInPage(nextId);

            if (sectIter)
                for (let item of sectIter) {
                    const sectData = await sectCache.getOrCreate(item);

                    if (this._titleFilter.value && sectData.title && !sectData.title.toLowerCase().includes(this._titleFilter.value.toLowerCase()))
                        continue;

                    const row: IProductNavRow =
                    {
                        $mdata: {
                            isFolder: true,
                            tag: "catalogSection",
                            getRowActionsMenu:  readonlymode? undefined : (row) => [
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
                        $isSelectable: catalogSectionSelectable
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
                            getRowActionsMenu:  readonlymode? undefined : () => [
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
                        $isSelectable: productSelectable
                    }
                    res.rows.push(row);
                }
            return res;
        }
    }



    async getPathByKey(key: string, recCode?: number) {
        let path: INavPathItem[] = [];
        const rawrecs = await this._ProductsApiSection.getProductPathRecs(key);
        let row: INavRow;

        rawrecs.forEach(v => {

            switch (v.code) {

                case ProductsCatalogRecord.RecCode:
                    path.push({
                        key: "0",
                        title: "Каталоги",
                        tag: { type: "catalogs", catalogKey: null, catalogSectionKey: null }
                    });
                    break;


                case ProductsCatalogSectionRecord.RecCode:
                    let d = v.entity as ProductsCatalogSectionRecordData;
                    path.push({
                        key: d.id!,
                        title: d.title,
                        tag: { type: "catalogSection", catalogKey: d.productsCatalog, catalogSectionKey: d.parent }
                    });
                    break;

                    case ProductRecord.RecCode:
                        let pd = v.entity as ProductRecordData;
                        row ={
                            $mdata: {
                                isFolder: false,
                                tag: "product"
                            },
                            id: pd.id!,
                            title: pd.title || ""
                        }
                        break;
            }
        });

        return { path, targetRow: row! }
    }


   
    getSelected() {
        return this._RefNavigator.value.getSelected();
    }



    render() {
        return () => <div style="height: 100%;">
            <v-row class="ma-1 h-100 bg-background">
                <v-col class="w-50 h-100 pt-0" style="min-width: 400; ">
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
                                    this.onNavigate(level, nextlevel, currPath, row)} 
                                    getPathByKey={(key: string, recCode?: number)=>this.getPathByKey(key, recCode)}/>;

                            //return h(KeepAlive, dt);
                            return dt;
                        })()
                    }
                </v-col>
            </v-row>
        </div>
    }

}