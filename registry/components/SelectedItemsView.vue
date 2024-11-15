<template>
    <v-menu location="end" :close-on-content-click="false">
        <template v-slot:activator="{ props }">

            <slot name="activator" :props="props">

            </slot>
        </template>

        <!--Тело элеметов-->
        <v-card variant="flat" class="mx-auto" title="Headline">
            <template v-slot:title>
                <v-row no-gutters>
                    <v-spacer />
                    <!--Кнопка очистки списка-->
                    <v-btn v-bind="props" prepend-icon="mdi-delete-outline" variant="text" size="small" @click="clear">
                        Очистить
                    </v-btn>
                </v-row>
            </template>

            <!--Список элементов-->
            <v-list>
                <v-list-item v-for="(item, index) in items" :key="index">
                    <v-row no-gutters class="align-center">
                        <!--Кнопка удаления из списка элемента-->
                        <v-btn v-bind="props" icon="mdi-close" variant="text" size="small"
                            @click="() => removeItem(item, index)" />
                        {{ item.title }}
                    </v-row>
                </v-list-item>
            </v-list>
        </v-card>
    </v-menu>



</template>



<script setup lang="ts">
import type { TDictViewVal } from '~/libVis/FinderDataProviders/FinderDataProvider';


interface Props {
    items: TDictViewVal[]
}

const props = defineProps<Props>();

const emit = defineEmits(["onRemoveItem", "onClearList"]);

const items = computed(()=>[...props.items]);


const removeItem = (item: TDictViewVal, inx) => {
    items.splice(inx, 1);
    emit('onRemoveItem', item);
};


const clear = () => {
    emit('onClearList', [...items]);
    items.length = 0;
};

</script>