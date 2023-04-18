import { Container } from "inversify";
import { IPageData, PageMap } from "~~/lib/PageMap";


export const regPageMeta = (meta:IPageData) => {
    const iocc = useContainer();
    const pageMap = iocc.get<PageMap>("PageMap");
    pageMap.setPageData(useRoute().path, meta);
  }

