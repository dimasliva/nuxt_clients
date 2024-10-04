
<script lang="ts">
import { Container } from "inversify";
import { useI18n } from "vue-i18n"
import { EFinderFormHistoryResultTypeStorage, FinderFormTemplate, type IFinderFormProps } from "~/componentTemplates/forms/finderFormTemplate"
import type { FinderDataProvider } from "~/libVis/FinderDataProviders/FinderDataProvider";



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

        historyResultTypeStorage: {
            type: Number,
            required: false
        },

        apiRequestTimeout: {
            type: Number,
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
        const o = new FinderFormTemplate(diC, props);
        await o.setup(props as IFinderFormProps, ctx);
        return o.render();
    }
}
</script>