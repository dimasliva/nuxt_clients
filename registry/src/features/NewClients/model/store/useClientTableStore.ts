import { defineStore } from "pinia";
import type { IClientParams } from "../types/clients";

export const useClientTableStore = defineStore("clientTableStore", {
  state: () => ({
    tableFilter: {
      limit: 100,
      orderBy: "changedAt desc",
      select: "id,name,surname,patronymic,birthdate",
      where: "changedAt <= '3000-01-01'",
    } as IClientParams,
  }),
  actions: {
    setTableFilter(value: IClientParams) {
      this.tableFilter = value;
    },
  },
});
