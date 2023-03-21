import { Container } from "inversify";
import "reflect-metadata";
import ioccSetup from "@/ioccSetup";


export const useContainer = () => {
  const app = useNuxtApp();
  if (!app.$iocContainer) {
    console.info("create container");
    app.provide('iocContainer',  new Container())
    ioccSetup();
  }
  return <Container>app.$iocContainer;
}