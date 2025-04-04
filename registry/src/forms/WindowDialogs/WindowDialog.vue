<template>
    <v-card :width="width || 800" :style="windowStyle">
        <v-card-title class="mx-2">
            <v-row class="pt-4 align-center">
                <div class="text-h5 ma-2">{{ frameHeaderData.title }}</div>
                <v-spacer></v-spacer>
                <!--Пользовательские кнопки окна-->
                <template v-for="(buttons, index) in frameHeaderData.mainBtnBar" :key="buttons.id">
                    <v-btn :disabled="buttons.disabled" elevation="0" class="mx-2" rounded="xl" :id="buttons.id"
                        :index="index" :icon="(buttons.title.length) ? false : buttons.icon"
                        :prepend-icon="(buttons.title.length >= 1) ? buttons.icon : undefined" variant="text"
                        :color="buttons.color" :background-color="buttons.bkgColor"
                        :text="(buttons.title.length) ? buttons.title : undefined"
                        :density="(buttons.title.length) ? `default` : `comfortable`" @click="() => buttons.action()" />
                </template>
                <!--Пользовательское меню окна-->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn v-if="frameHeaderData.mainMenu" v-bind="props" variant="outlined" color="secondary"
                            size="small" class="mx-4" :icon="frameHeaderData.mainMenu.icon" />
                    </template>
                    <v-list>
                        <v-list-item v-for="child in frameHeaderData.mainMenu?.childs" :key="child.id"
                            :disabled="child.disabled" @click="() => child.action()">
                            <v-list-item-title>{{ child.title }}<v-icon end :icon="child.icon"
                                    size="x-small" /></v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <!--Иконка закрытия окна-->
                <v-icon class="mt-n5 ml-3" @click="close()">mdi-close</v-icon>
            </v-row>
        </v-card-title>

        <v-card-text class="overflow-y-auto pb-0 h-100 pt-0">
            <slot>

            </slot>
        </v-card-text>


        <v-card-actions class="mr-4 mb-1">
            <v-spacer></v-spacer>

            <slot name="buttons" :props="buttonsSlotProps">

                <v-btn v-if="okTitle !== null" color="primary" variant="text" @click="() => ok(onOk?.())">
                    {{ okTitle || 'Ок' }}
                </v-btn>

                <v-btn color="primary" variant="text" @click="() => close()">
                    {{ closeTitle || 'Закрыть' }}
                </v-btn>
            </slot>


        </v-card-actions>
    </v-card>
</template>



<script setup lang="ts">
import type { Container } from 'inversify';
import type { IFrameHeaderData } from '~/src/common/lib/PageMap';


defineOptions({
    inheritAttrs: false,
    customOptions: {}
})


interface IProps {
    diC?: Container | null;
    onOk?: () => any;
    onClose?: () => Promise<boolean>;
    onEvent?: (ev, data) => Promise<void>;
    height?: string | null;
    width?: string | null;
    okTitle?: string | null;
    closeTitle?: string | null;
    frameHeaderData: IFrameHeaderData;
}
const props = defineProps<IProps>();

const eventsHandler = (e: string, d: any) => {
    debugger;
    props.onEvent?.(e, d);
};


const windowStyle = {
    height: props.height || "90dvh",
    "min-width": props.width || 0
}

const close = async () => {
    if (!props.onClose || props.onClose && await props.onClose())
        closeDialog(undefined);
}

const ok = async (res) => closeDialog(res || null);


const buttonsSlotProps = {
    close,
    ok
}

const defSlotProps = {
    eventsHandler
}


defineExpose({ eventsHandler });


</script>