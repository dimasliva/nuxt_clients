
<script lang="ts">
import type { Container } from "inversify";
import { useI18n } from "vue-i18n"
import type { IRenderedTemplateComponent } from "~components/types";
import { SelectFormTemplate } from "./SelectFormTemplate"



export default {

    inheritAttrs: true,
    props: {
        diC: {
            type: Object as PropType<Container>,
            required: false
        },

        componentTemplate:
         {
            type: Object as PropType<IRenderedTemplateComponent>,
            required: true
        },

        title: {
            type: String,
            required: true
        },

    
        selectedOptionsValues: {
            type: Array as PropType<any[]>,
            required: false
        },

    },


    async setup(props, ctx) {
        let t = useI18n().t;
        const diC= props.diC || useSessionContainer();
        const o = new SelectFormTemplate(diC, { title: props.title, componentTemplate: props.componentTemplate});
        await o.setup(props,ctx);
        return o.render();
    }
}
</script>