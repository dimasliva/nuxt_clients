import { Container } from "inversify";
import "reflect-metadata";
import ioccSetup from "~~/ioccInitConfig";
import { RecordsStore } from "@/lib/MoApi/Records/RecordsStore";
import MemoryCache from "~/lib/MemoryCache";

export const useContainer = () => {
  const app = useNuxtApp();
  if (!app.$iocContainer) {
    console.info("create container");
    const cont = new Container();
    app.provide('iocContainer', cont)
    ioccSetup(cont);
  }
  return <Container>app.$iocContainer;
}


export const useSessionContainer = () => {
  const iocc = useContainer();
  const scont = iocc.createChild();
  
  scont.bind("RecordsStore").to(RecordsStore).inSingletonScope();
  scont.bind("Cache").to(MemoryCache).inSingletonScope();
  return scont;
}