
import type { Container } from "inversify";
import { Exception } from "~/lib/Exceptions";
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";

export async function useEditForm(loadFunc: () => Promise<Ref<ApiRecord | undefined>>, saveFunc: () => Promise<void>, _readonly?: boolean) {

    const readonly = ref(_readonly || false);
    let isChangesSaved = false;

    const rec = await loadFunc();
    if (!rec.value)
        throw new Exception("Err", "Запись не загружена");

    if (_readonly) {
        return {
            readonly: true, close: () => rec.value?.Key, save: async () => {}
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
            return isChangesSaved ? rec.value?.Key : null;
        }


        const save = async () => {
            await saveFunc();
            isChangesSaved = true;
        }



        return {
            readonly, close, save
        }
    }
}



export function useEditFormBegin(props) {

    const diC: Container = props.diC || useSessionContainer();
    const recStore = diC.get<RecordsStore>("RecordsStore");

    const eventsHandler = (e: string, d: any) => {
        switch (e) {
            case "onKeydown": return true;
        }
    };


    return {
        diC, recStore, eventsHandler
    }
}



export interface IEditFormProps {
    diC?: Container,
    recKey: string | null;
    readonly?: boolean;
}





