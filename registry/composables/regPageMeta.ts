import { Container } from "inversify";
import { IFrameHeaderData, PageMap } from "~~/lib/PageMap";


export const regPageMeta = (meta:IFrameHeaderData) => {
    const iocc = useContainer();
    const pageMap = iocc.get<PageMap>("PageMap");
    pageMap.setPageData(useRoute().path, meta);
  }

