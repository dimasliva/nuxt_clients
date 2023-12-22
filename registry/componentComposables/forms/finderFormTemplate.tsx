
import { QueryParams } from "~/lib/MoApi/RequestArgs";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { UserContext } from "~/lib/UserContext";
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~~/libVis/Helpers';
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import WindowDialog from "~/components/forms/WindowDialog.vue"
import { sleep } from "~/lib/Helpers";
import { h } from 'vue'


let t: any;

export interface IFinderFormProps {
    label?: string,
    title: string,
    getList: (text: string, ...args) => Promise<{ value: any, title: string }[]>;
}


export abstract class FinderFormTemplate {

    iocc = useContainer();
    userCtx = this.iocc.get<UserContext>('UserContext');
    loading = ref(false);
    props: IFinderFormProps = null!;

    valueList = ref([] as { value: any, title: string }[]);
    searchingText = ref("");
    searchFieldRef = ref();
    selected = ref([]);

    lastFindRequestDate: number | null = null;
    searchTimeout: any | null = null;
    //testprop:Ref<any>;


    constructor() {
        if (!t) t = useNuxtApp().$i18n.t;
    }



    setup(props: IFinderFormProps, ctx?) {
        this.loading.value = false;
        this.props = props;

        onMounted(() => {
            nextTick((() => setTimeout(() => { this.searchFieldRef.value.focus(); }, 10)));
        });
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
                this.valueList.value = await this.props.getList(this.searchingText.value);
                this.lastFindRequestDate = Date.now();
            }
            else
                this.valueList.value = [];
        }
        finally {
            this._onfindSingleExec = false;
        }
    }



    async onSelect(e) {
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



    getListsField() {
        return <v-card class="overflow-y-auto w-100" style="height:90%;">
            <v-list lines="one" density="compact" class="ma-0 pa-0" items={this.valueList.value}  v-model:selected={this.selected.value} 
             onUpdate:selected={(e)=>{this.onSelect(e)}} 
            />
        </v-card>
    }



    getEmptyListsField() {
        return undefined;
    }



    render() {

        return () =>
            <WindowDialog title={this.props.title} width="700" height="85dvh">
                <v-text-field ref={this.searchFieldRef} clearable label={this.props.label || ''} variant="filled" density="compact" v-model={this.searchingText.value} prepend-icon="mdi-magnify"
                    onInput={() => this.onSearchTextInput()} />

                {
                    this.loading.value ?
                        <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                        :

                        (this.valueList.value?.length > 0) ?
                            this.getListsField() :
                            this.getEmptyListsField()
                }


            </WindowDialog>
    }
}