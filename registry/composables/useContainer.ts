import { Container } from "inversify";
import "reflect-metadata";
import ioccSetup from "~~/ioccConfig";


export const useContainer = () => {
  const app = useNuxtApp();
  if (!app.$iocContainer) {
    console.info("create container");
    const cont=new Container();
    app.provide('iocContainer',cont)
    ioccSetup(cont);
  }
  return <Container>app.$iocContainer;
}