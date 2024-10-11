<script lang="ts">
import type { Container } from "inversify";
import { useI18n } from "vue-i18n"
import { FinderFormSelectTemplate, type IFinderFormSelectProps } from "~/componentTemplates/forms/finderFormSelectTemplate"
import type { FinderDataProvider, TDictViewVal } from "~/libVis/FinderDataProviders/FinderDataProvider";



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
            type: Array as PropType<TDictViewVal[]>,
            required: false
        },

        selectedOptionsValues: {
            type: Array as PropType<any[]>,
            required: false
        },

        selectFormComponent: {
            type: Object,
            required: false
        }

    },


    async setup(props, ctx) {
        const diC = props.diC || useSessionContainer();
        let t = useI18n().t;
        const o = new FinderFormSelectTemplate(diC, props as IFinderFormSelectProps);
        await o.setup(props, ctx);
        return o.render();
    }
}
</script>