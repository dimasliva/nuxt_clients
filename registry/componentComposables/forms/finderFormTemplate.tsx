
import { QueryParams } from "~/lib/MoApi/RequestArgs";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { UserContext } from "~/lib/UserContext";
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~~/libVis/Helpers';
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import WindowDialog from "~/components/forms/WindowDialog.vue"


let t: any;

export abstract class FinderFormTemplate {

    iocc = useContainer();
    userCtx = this.iocc.get<UserContext>('UserContext');
    loading = ref(false);



    constructor() {
        if (!t) t = useNuxtApp().$i18n.t;
    }



    setup() {
        this.loading.value=false;
    }



    eventsHandler(e: string, d: any) {
        switch (e) {
            case "onKeydown":
                return true;
        }
    }



    render() {

        return () =>
            <WindowDialog title="Поиск" width="700" height="85dvh">
                <v-text-field clearable label="Поиск" variant="filled" density="compact" append-inner-icon="mdi-magnify" />
                {
                    this.loading.value ?
                    <v-progress-linear style="width:98%" color="primary" class="ma-1" indeterminate />
                        :
                        <v-list lines="one" density="compact" class="ma-0 pa-0 ">
                        <v-list-item v-for="item in items" density="compact" class="py-0 my-0" >
                           
                        </v-list-item>
                    </v-list>    
                }


            </WindowDialog>
    }
}