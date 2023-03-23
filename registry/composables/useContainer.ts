import { Container } from "inversify";
import "reflect-metadata";
import ioccSetup from "~~/ioccConfig";
import { RecordsStore } from "@/lib/MoApi/Records/RecordsStore";

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
  return scont;
}