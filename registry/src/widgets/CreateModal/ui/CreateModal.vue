<script lang="ts" setup>
interface IProps {
  isOpen: boolean;
  isAdd?: boolean;
  addTitle?: string;
  title: string;
}

interface IEmits {
  (e: "onClose"): void;
  (e: "onSave"): void;
  (e: "onSaveAndClose"): void;
  (e: "onAdd"): void;
  (e: "onAddAndClose"): void;
}
const props = defineProps<IProps>();
const emit = defineEmits<IEmits>();
</script>

<template>
  <v-dialog v-model="props.isOpen" max-width="800">
    <template v-slot:default="{ isActive }">
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            {{ isAdd ? addTitle : title }}
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="() => emit('onClose')"
          ></v-btn>
        </v-card-title>

        <v-card-text>
          <slot />
        </v-card-text>

        <v-card-actions class="my-2 d-flex justify-end">
          <v-btn
            class="text-none"
            variant="outlined"
            :text="$t('close')"
            @click="() => emit('onClose')"
          ></v-btn>
          <v-btn
            class="text-none"
            :text="$t('add')"
            variant="outlined"
            @click="() => emit('onAdd')"
            v-if="isAdd"
          ></v-btn>
          <v-btn
            class="text-none"
            :text="$t('save')"
            variant="outlined"
            @click="() => emit('onSave')"
            v-else
          ></v-btn>
          <v-btn
            class="text-none"
            color="primary"
            :text="$t('addAndClose')"
            variant="flat"
            @click="() => emit('onAddAndClose')"
            v-if="isAdd"
          ></v-btn>
          <v-btn
            v-else
            class="text-none"
            color="primary"
            :text="$t('saveAndClose')"
            variant="flat"
            @click="() => emit('onSaveAndClose')"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
