import { defineStore } from "pinia";
import type { IClientParams } from "../types/clients";

export const useClientTableStore = defineStore("clientTableStore", {
  state: () => ({
    tableFilter: {
      limit: 100,
      orderBy: "changedAt desc",
      select: "id,name,surname,patronymic,birthdate,gender,mainPhone,mainEmail,snils",
      where: "changedAt <= '3000-01-01'",
      // where: "surname like 'Dwddw%' and mainPhone='79564684644848484' and mainEmail='wdwd@e1.ru' and snils='16196818981'"
    } as IClientParams,
  }),
  actions: {
    setTableFilter(value: IClientParams) {
      this.tableFilter = value;
    },
  },
});
