<script lang="ts" setup>
interface IProps {
  isOpen: boolean;
  title: string;
}

interface IEmits {
  (e: "onClose"): void;
  (e: "onSave"): void;
  (e: "onSaveAndClose"): void;
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
            {{ title }}
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
            color="primary"
            :text="$t('save')"
            variant="flat"
            @click="() => emit('onSave')"
          ></v-btn>

          <v-btn
            class="text-none"
            color="primary"
            :text="$t('saveAndClose')"
            variant="flat"
            @click="() => emit('onSaveAndClose')"
          ></v-btn>
          
          <v-btn
            class="text-none"
            rounded="xl"
            :text="$t('close')"
            @click="() => emit('onClose')"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
