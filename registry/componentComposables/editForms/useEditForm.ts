
export async function useEditForm(rec: Ref<any>, _readonly?: boolean) {

    const readonly = ref(_readonly || false);

    if (_readonly) {
        return {
            readonly: true, close: () => rec.value?.Key
        }
    }
    else {
        ///Блокировка записей

        if (!rec.value.IsNew) {
            {
                if (!rec.value.isLocked) {
                    warnToast("Запись заблокирована для изменения. Редакция невозможна");
                    readonly.value = true;
                }
                else
                    readonly.value = false;
            }
        }


        const close = () => {
            if (rec.value) {
                rec.value.unlock();
            }
            return rec.value?.Key;
        }


        return {
            readonly, close
        }
    }
}


