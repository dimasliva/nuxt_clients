
<script lang="ts">
import type { Container } from "inversify";
import { useI18n } from "vue-i18n"
import { FinderFormMultipleTemplate, type IFinderFormMultipleProps } from "~/componentTemplates/forms/finderFormMultipleTemplate"
import type { FinderDataProvider, TDictViewVal } from "~/libVis/FinderDataProvider";


class FinderMultipleForm extends FinderFormMultipleTemplate { }


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

        choosedValues: {
            type: Array as  PropType<TDictViewVal[]>,
            required: false
        }
    },


    async setup(props, ctx) {

        let t = useI18n().t;
        const o = new FinderMultipleForm();
        await o.setup(props as IFinderFormMultipleProps, ctx);

        ctx.expose({
            eventsHandler: (e, d) => o.eventsHandler(e, d)
        });

        return o.render();
    }
}
</script>