<template>
    <v-card :width="width||800" :style="windowStyle">
        <v-card-title class="mx-2">
            <v-row class="pt-4">
                <div class="text-h5 ma-2">{{ title }}</div>

                <v-spacer></v-spacer>
                <v-icon @click="close()">mdi-close</v-icon>
            </v-row>
        </v-card-title>

        <v-card-text class="overflow-y-auto pb-0">
            <slot>

            </slot>
        </v-card-text>


        <v-card-actions class="mr-4 mb-1">
            <v-spacer></v-spacer>

            <slot name="buttons" :props="buttonsSlotProps">

                <v-btn v-if="okTitle!==null" color="primary" variant="text" @click="() => ok(onOk?.() || null)">
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

defineOptions({
    inheritAttrs: false,
    customOptions: {}
})


interface IProps {
    onOk?: () => any;
    onEvent?: (ev, data) => Promise<void>;
    title: string,
    icon?: string
    height?: string;
    width?: string;
    okTitle?: string;
    closeTitle?: string;
}
const props = defineProps<IProps>();

const eventsHandler = (e: string, d: any) => {
    props.onEvent?.(e, d);
};


const windowStyle = {
    height: props.height || "90dvh"
}

const close = async () => closeDialog(null);
const ok = async (res) => closeDialog(res);

const buttonsSlotProps = {
    close,
    ok
}

const defSlotProps = {
    eventsHandler
}


defineExpose({ eventsHandler });


</script>