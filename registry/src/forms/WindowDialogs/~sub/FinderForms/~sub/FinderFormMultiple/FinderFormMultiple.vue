
<script lang="ts">
import type { Container } from "inversify";
import { useI18n } from "vue-i18n"
import { FinderFormMultipleTemplate, type IFinderFormMultipleProps } from "./FinderFormMultipleTemplate"
import type { IFinderFormProps } from "~forms/WindowDialogs/~sub/FinderForms/FinderFormTemplate";
import type { FinderDataProvider, TDictViewVal } from "~/src/ui_tools/FinderDataProviders/FinderDataProvider";


export default {

    inheritAttrs: false,
    props: {
        diC: {
            type: Object as PropType<Container>,
            required: false
        },

        title: {
            type: String,
            required: true
        },

        label: String,

        finderDataProvider: {
            type: Object as PropType<FinderDataProvider>,
            required: true
        },

        apiRequestTimeout: {
            type: Number,
            required: false
        },

        choosedValues: {
            type: Array as  PropType<TDictViewVal[]>,
            required: false
        },

        selectFormComponent: {
            type: Object,
            required: false
        }
        
    },


    async setup(props, ctx) {
        let t = useI18n().t;
        const diC= props.diC || useSessionContainer();
        const o = new FinderFormMultipleTemplate(diC, props);
        await o.setup(props as IFinderFormProps, ctx);
        return o.render();
    }
}
</script>