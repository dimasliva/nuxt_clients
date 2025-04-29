<script lang="ts" setup>
interface IProps {
  isOpen: boolean;
  title: string;
  tooltipDisableBtnText?: string;
  addTitle?: string;
  isAdd?: boolean;
  isDisableSave?: boolean;
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
  <v-dialog
    v-model="props.isOpen"
    transition="dialog-bottom-transition"
    width="90%"
    max-width="1200px"
    height="100%"
    max-height="780px"
  >
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

          <v-tooltip
            v-if="tooltipDisableBtnText && tooltipDisableBtnText.length"
            :text="tooltipDisableBtnText"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <span v-bind="props">
                <VBtn
                  class="text-none"
                  :text="$t('add')"
                  variant="outlined"
                  :disabled="isDisableSave"
                  @click="() => emit('onAdd')"
                  v-if="isAdd"
                />
                <VBtn
                  v-else
                  v-bind="props"
                  class="text-none"
                  :text="$t('save')"
                  variant="outlined"
                  :disabled="isDisableSave"
                  @click="() => emit('onSave')"
                />
              </span>
            </template>
          </v-tooltip>

          <span v-else>
            <VBtn
              class="text-none"
              :text="$t('add')"
              variant="outlined"
              :disabled="isDisableSave"
              @click="() => emit('onAdd')"
              v-if="isAdd"
            />
            <VBtn
              v-else
              v-bind="props"
              class="text-none"
              :text="$t('save')"
              variant="outlined"
              :disabled="isDisableSave"
              @click="() => emit('onSave')"
            />
          </span>

          <v-tooltip
            v-if="tooltipDisableBtnText && tooltipDisableBtnText.length"
            :text="tooltipDisableBtnText"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <span v-bind="props">
                <v-btn
                  class="text-none"
                  color="primary"
                  :text="$t('addAndClose')"
                  variant="flat"
                  :disabled="isDisableSave"
                  @click="() => emit('onAddAndClose')"
                  v-if="isAdd"
                ></v-btn>
                <v-btn
                  v-else
                  class="text-none"
                  color="primary"
                  :text="$t('saveAndClose')"
                  variant="flat"
                  :disabled="isDisableSave"
                  @click="() => emit('onSaveAndClose')"
                ></v-btn>
              </span>
            </template>
          </v-tooltip>
          <span v-else>
            <v-btn
              class="text-none"
              color="primary"
              :text="$t('addAndClose')"
              variant="flat"
              :disabled="isDisableSave"
              @click="() => emit('onAddAndClose')"
              v-if="isAdd"
            ></v-btn>
            <v-btn
              v-else
              class="text-none"
              color="primary"
              :text="$t('saveAndClose')"
              variant="flat"
              :disabled="isDisableSave"
              @click="() => emit('onSaveAndClose')"
            ></v-btn>
          </span>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
