import axios, { type CreateAxiosDefaults } from "axios";
import { setBearer } from "./useApiFunc";

const mainApiServer = "172.16.121.60";
const mainApiServerPort = 7132;

const server = mainApiServer
const port = mainApiServerPort
export const SERVER_URL = `https://${server}:${port}`

 const apiV1 = "api/v1"

 export const API_URL = {
    root: (url = "") => `${url ? url : ""}`,
    auth: (url = "") => API_URL.root(`api/auth/auth${url}`),
    dictionaries: (url = "") => API_URL.root(`${apiV1}/Dictionaries${url}`),
    files: (url = "") => API_URL.root(`${apiV1}/Files${url}`),
    employees: (url = "") => API_URL.root(`${apiV1}/Employees${url}`),
    clients: (url = "") => API_URL.root(`${apiV1}/Clients${url}`),
    records: (url = "") => API_URL.root(`${apiV1}/Records${url}`),
  };

const options: CreateAxiosDefaults = {
    baseURL: SERVER_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  const optionsBlob: CreateAxiosDefaults = {
    baseURL: SERVER_URL,
    headers: {
      "Content-Type": "application/json",
    },
    responseType: 'blob'
  };

  const optionsFormData: CreateAxiosDefaults = {
    baseURL: SERVER_URL,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
  
export const axiosClassic = axios.create(options);
export const axiosWithAuth = axios.create(options);
export const axiosWithAuthTypeBlob = axios.create(optionsBlob);
export const axiosWithAuthTypeFormData = axios.create(optionsFormData);

setBearer(axiosWithAuth)
setBearer(axiosWithAuthTypeBlob)
setBearer(axiosWithAuthTypeFormData)