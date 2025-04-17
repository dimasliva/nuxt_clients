import { useQuery } from "@tanstack/vue-query";
import { ClientService } from "../service/ClientService";
import { useClientTableStore } from "../store/useClientTableStore";
import { useTableHeader } from "~/src/widgets/PageTable/model/hooks/useTableHeader";
import type { ITable } from "~/src/widgets/PageTable/model/types/pagetable";

export const useGetClients = () => {
  const store = useClientTableStore();
  const { tableFilter } = storeToRefs(store);
  const {  } = store

  const tableData = reactive<ITable>({
    columns: [],
    rows: [],
  })
  const {tableHeader} = useTableHeader()

  const { isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get clients"],
    queryFn: () => ClientService.getClients(tableFilter.value),
    select: (response) => {
      if (response) {
        const responseRows: string[][] = response.result.data;
        const responseHeaders: string[] = response.result.headers;
        responseRows.forEach((val) => {
          tableData.rows.push({
            id: val[0],
            name: val[1],
            surname: val[2],
            patronymic: val[3],
            birthdate: val[4],
          });
        });
        responseHeaders.forEach((key) => {
          tableData.columns.push({
            key: key,
            title: tableHeader[key].title,
            sortable: tableHeader[key].sortable,
            align: tableHeader[key].align,
            width: tableHeader[key].width,
          });
        });
      }
    },
  });

  return {
    tableData,
    isLoading,
    isError,
    error,
    isPending,
  };
};
