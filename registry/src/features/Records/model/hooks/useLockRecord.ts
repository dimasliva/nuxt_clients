import { useMutation,  } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useLockRecord = () => {
  const store = useRecordStore();
  const { id } = storeToRefs(store);

  const { mutate: lockRecord, isPending: isPendingLockRecord } =
    useMutation({
      mutationKey: ["lock record", id.value],
      mutationFn: () => RecordService.lockRecord(id.value),
      onSuccess: (response) => {
      },
      onError: (error: any) => {
        toast.error("Ошибка при блокировки записи!");
      },
    });

  return {
    lockRecord,
    isPendingLockRecord,
  };
};
