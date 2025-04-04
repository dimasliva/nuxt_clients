import { Container } from "inversify";
import "reflect-metadata";
import ioccSetup from "~/src/configs/ioccInitConfig";
import { RecordsStore } from "~/src/common/lib/MoApi/Records/RecordsStore";
import MemoryCache from "~/src/common/lib/Cache/MemoryCache";

export const useContainer = () => {
  const app = useNuxtApp();
  if (!app.$iocContainer) {
    console.info("create container");
    const cont = new Container({ autoBindInjectable: true });
    app.provide('iocContainer', cont)
    ioccSetup(cont);
  }
  return <Container>app.$iocContainer;
}


export const useSessionContainer = (...singletonTypes) => {
  const iocc = useContainer();
  const scont = iocc.createChild(); //new Container({parent:iocc, autobind: true }); 

  scont.bind('diC').toConstantValue(scont);
  scont.bind("RecordsStore").to(RecordsStore).inSingletonScope();
  scont.bind("Cache").to(MemoryCache).inSingletonScope();

  singletonTypes.forEach(item => {
    scont.bind(item).to(item).inSingletonScope();
  })

  return scont;
}