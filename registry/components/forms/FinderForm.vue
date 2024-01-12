
<script lang="ts">
import { useI18n } from "vue-i18n"
import { FinderFormTemplate, type IFinderFormProps } from "~/componentComposables/forms/finderFormTemplate"
import { FinderDataProvider } from "~/libVis/FinderDataProvider";

class FinderForm extends FinderFormTemplate {}


export default {

    inheritAttrs: false,
    props: {
        title: {
            type: String,
            required: true
        },
        label: String,

        finderDataProvider: {
            type: Object,
            required: true
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