
<script lang="ts">
import { useI18n } from "vue-i18n"
import { FinderFormTemplate } from "~/componentComposables/forms/finderFormTemplate"

class FinderForm extends FinderFormTemplate {

}



export default {
    setup(props, { expose }) {

        let t = useI18n().t;
        const o = new FinderForm();
        o.setup();

        expose({
            eventsHandler: (e, d) => o.eventsHandler(e, d)
        });

        return o.render();
    }
}
</script>