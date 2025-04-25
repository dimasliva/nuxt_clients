import { useQuery } from "@tanstack/vue-query";
import { ClientService } from "../service/ClientService";
import { useClientTableStore } from "../store/useClientTableStore";
import { useTableHeader } from "~/src/widgets/PageTable/model/hooks/useTableHeader";
import type { ITable } from "~/src/widgets/PageTable/model/types/pagetable";
import { useGender } from "~/src/shared/utils/useGender/useGender";

export const useGetClients = () => {
  const store = useClientTableStore();
  const { tableFilter } = storeToRefs(store);
  const {} = store;

  const tableData = reactive<ITable>({
    columns: [],
    rows: [],
  });
  const { tableHeader } = useTableHeader();
  const {getGender} = useGender()

  const { isLoading, isError, error, isPending, refetch } = useQuery({
    queryKey: ["get clients"],
    queryFn: () => ClientService.getClients(tableFilter.value),
    select: (response) => {
      if (response) {
        const responseRows: string[][] = response.result.data;
        const responseHeaders: string[] = response.result.headers;

        tableData.rows = [];
        tableData.columns = [];

        responseRows.forEach((val) => {
          tableData.rows.push({
            id: val[0],
            fio: `${val[2]} ${val[1]} ${val[3] ? val[3] : ''}`,
            birthdate: val[4],
            gender: getGender(val[5]),
            mainPhone: val[6],
            mainEmail: val[7],
            snils: val[8]
          });
        });
        responseHeaders.forEach((key) => {
          if (key !== "name" && key !== "surname" && key !== "patronymic") {
            tableData.columns.push({
              key: key,
              title: tableHeader[key].title,
              sortable: tableHeader[key].sortable,
              align: tableHeader[key].align,
              width: tableHeader[key].width,
            });
          }
        });
        const keyFio = "fio";
        tableData.columns.push({
          key: keyFio,
          title: tableHeader[keyFio].title,
          sortable: tableHeader[keyFio].sortable,
          align: tableHeader[keyFio].align,
          width: tableHeader[keyFio].width,
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
    refetch,
  };
};
