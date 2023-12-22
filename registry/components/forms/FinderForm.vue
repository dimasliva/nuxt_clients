
<script lang="ts">
import { useI18n } from "vue-i18n"
import { FinderFormTemplate, type IFinderFormProps } from "~/componentComposables/forms/finderFormTemplate"

class FinderForm extends FinderFormTemplate {

}



export default {

    inheritAttrs: false,
    props: {
        title: {
            type: String,
            required: true
        },
        label: String,

        getList: {
            type: Function,
            required: true
        }
    },

    async setup(props, ctx) {

        let t = useI18n().t;
        const o = new FinderForm();
        o.setup(props as IFinderFormProps);

        ctx.expose({
            eventsHandler: (e, d) => o.eventsHandler(e, d)
        });

        return o.render();
    }
}
</script>