import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";

export async function useEditForm(rec: Ref<any>) {
    const isRecLock = ref();
    const readonly = ref(false);

    ///Блокировка записей
    watch(isRecLock, (val) => {
        if (!val) {
            warnToast("Запись заблокирована для изменения. Редакция невозможна");
            readonly.value = true;
        }
        else
            readonly.value = false;
    });

    let pingLockInterval: any = null;
    if (!rec.value.IsNew) {
        isRecLock.value = await rec.value.lock();

        pingLockInterval = setInterval(async () => {
            isRecLock.value = await rec.value!.lock();
        }, 150 * 1000)
    }


    const close = () => {
        if (pingLockInterval) {
          clearInterval(pingLockInterval);
          rec.value!.unlock();
        }
        return rec.value?.Key;
      }


    return {
        isRecLock, readonly,close
    }


}


