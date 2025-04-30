<template>
  <v-menu location="end" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <slot name="activator" :props="props"> </slot>
    </template>

    <!--Тело элементов-->
    <template v-slot:default="{ isActive }">
      <v-card variant="flat" class="mx-auto" title="Headline">
        <template v-slot:title>
          <v-row no-gutters>
            <v-spacer />
            <VBtn
              v-bind="props"
              prepend-icon="mdi-delete-outline"
              variant="text"
              size="small"
              @click="
                () => {
                  emit('onDeleteList');
                  isActive.value = false;
                }
              "
            >
              Удалить
            </VBtn>
            <!--Кнопка очистки списка-->
            <VBtn
              v-bind="props"
              prepend-icon="mdi-cancel"
              variant="text"
              size="small"
              @click="
                () => {
                  emit('onClearList');
                  isActive.value = false;
                }
              "
            >
              Очистить
            </VBtn>
          </v-row>
        </template>

        <!--Список элементов-->
        <v-list class="pt-0">
          <v-list-item v-for="(item, index) in items" :key="index">
            <v-row no-gutters class="align-center">
              <!--Кнопка удаления из списка элемента-->
              <v-btn
                v-bind="props"
                icon="mdi-close"
                variant="text"
                size="small"
                @click="() => removeItem(item, index)"
              />
              {{ item.title }}
            </v-row>
          </v-list-item>
        </v-list>
      </v-card>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import type { TDictViewVal } from "~/src/ui_tools/FinderDataProviders/FinderDataProvider";

interface Props {
  items: TDictViewVal[];
}

const props = defineProps<Props>();
interface IEmits {
  (e: "onRemoveItem", item: TDictViewVal, inx: number): void;
  (e: "onClearList"): void;
  (e: "onDeleteList"): void;
}

const emit = defineEmits<IEmits>();

const items = computed(() => [...props.items]);

const removeItem = (item: TDictViewVal, inx) => {
  emit("onRemoveItem", item, inx);
};
</script>
