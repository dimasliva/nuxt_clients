import axios, { type CreateAxiosDefaults } from "axios";
import { setBearer } from "./useApiFunc";

const mainApiServer = "172.16.121.60";
const mainApiServerPort = 7132;

const server = mainApiServer
const port = mainApiServerPort
export const SERVER_URL = `https://${server}:${port}`

 export const apiV1 = "/api/v1"

 export const API_URL = {
    root: (url = "") => `${url ? url : ""}`,
    auth: (url = "") => API_URL.root(`api/auth/auth${url}`),
    dictionaries: (url = "") => API_URL.root(`api/v1/Dictionaries${url}`),
    clients: (url = "") => API_URL.root(`api/v1/Clients${url}`),
    records: (url = "") => API_URL.root(`api/v1/Records${url}`),
  };

const options: CreateAxiosDefaults = {
    baseURL: SERVER_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  
export const axiosClassic = axios.create(options);
export const axiosWithAuth = axios.create(options);
setBearer(axiosWithAuth)