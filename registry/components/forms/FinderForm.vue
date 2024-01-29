
<script lang="ts">
import { Container } from "inversify";
import { useI18n } from "vue-i18n"
import { EFinderFormHistoryResultTypeStorage, FinderFormTemplate, type IFinderFormProps } from "~/componentTemplates/forms/finderFormTemplate"
import type { FinderDataProvider } from "~/libVis/FinderDataProvider";

class FinderForm extends FinderFormTemplate { }


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
        }
    },


    async setup(props, ctx) {

        let t = useI18n().t;
        const o = new FinderForm();
        await o.setup(props as IFinderFormProps, ctx);

        ctx.expose({
            eventsHandler: (e, d) => o.eventsHandler(e, d)
        });

        return o.render();
    }
}
</script>