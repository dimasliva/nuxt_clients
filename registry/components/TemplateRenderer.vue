<script lang="ts">
import { StandartComponentEvents, type IRenderedTemplateComponent, type IRenderedTemplateComponentProps } from '~/componentTemplates/componentTemplates';


interface ITemplateRenderProps {
  templateInstance: IRenderedTemplateComponent,
  props?: IRenderedTemplateComponentProps
}


export default {

  props: {
    templateInstance: { type: Object as PropType<IRenderedTemplateComponent>, required: true },
    props: Object as PropType<IRenderedTemplateComponentProps>
  },

  emits: StandartComponentEvents,

  async setup(props: ITemplateRenderProps, ctx) {
    const o = props.templateInstance;
    await o.setup(ctx);
    return o.render();
  }
}

</script>