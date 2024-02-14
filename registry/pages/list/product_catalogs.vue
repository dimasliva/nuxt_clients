<script  lang="ts">

import { useI18n } from "vue-i18n"
import type { Container } from 'inversify';
import { ProductNavigatorTemplate, type IProductNavigatorTemplateProps } from "~/componentTemplates/navigatorTemplates/productNavigatorTemplate";
import type { PageMap } from "~/lib/PageMap";


let t: any;


class ProductCatalogNav extends ProductNavigatorTemplate
{

  async setup(props,ctx) {
    await super.setup(props,ctx);
  }

  //Настройки по умолчанию
  defPageSettings = { tcols: ["fio", "position"] };
}



export default {
  props: {
        diC: {
            type: Object as PropType<Container>,
            required: false
        }
    },



  async setup(props:IProductNavigatorTemplateProps, ctx) {
    t = useI18n().t;
    const diC= props.diC || useContainer();
   
    diC.get<PageMap>("PageMap").setPageData("/list/product_catalogs", {title:"Прайс-тест"});

    const o = diC.get(ProductCatalogNav);
    await o.setup(props,ctx);


  

    const del = () => { }

    ctx.expose({
      eventsHandler: (e, d) => o.eventsHandler(e, d)
    });

    return o.render();
  }
}


</script>