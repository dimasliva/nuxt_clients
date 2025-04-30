import { useMutation,  } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useUnLockRecord = () => {
  const store = useRecordStore();
  const { id } = storeToRefs(store);

  const { mutate: unLockRecord, isPending: isPendingUnLockRecord } =
    useMutation({
      mutationKey: ["unlock record", id.value],
      mutationFn: () => RecordService.UnlockRecord(id.value),
      onSuccess: (response) => {
      },
      onError: (error: any) => {
        toast.error("Ошибка при разблокировки записи!");
      },
    });

  return {
    unLockRecord,
    isPendingUnLockRecord,
  };
};
