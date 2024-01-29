
<script lang="ts">
import { useI18n } from "vue-i18n"
import { FinderFormMultipleTemplate} from "~/componentComposables/forms/finderFormMultipleTemplate"
import type { IFinderFormProps } from "~/componentComposables/forms/finderFormTemplate";


class FinderMultipleForm extends FinderFormMultipleTemplate {}


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
        const o = new FinderMultipleForm();
        await o.setup(props as IFinderFormProps, ctx);

        ctx.expose({
            eventsHandler: (e, d) => o.eventsHandler(e, d)
        });

        return o.render();
    }
}
</script>