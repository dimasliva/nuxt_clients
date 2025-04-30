import { defineStore } from "pinia";

export const useRecordStore = defineStore("recordStore", {
  state: () => ({
    id: "" as string
  }),
  actions: {
    setRecordId(value: string) {
      this.id = value;
    },
  },
});
