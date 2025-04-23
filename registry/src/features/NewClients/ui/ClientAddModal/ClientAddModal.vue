<script lang="ts" setup>
import "@vuepic/vue-datepicker/dist/main.css";
import { EClientTabs } from "../../model/types/clients";

interface IProps {
  isOpen: boolean;
  title: string;
}

interface IEmits {
  (e: "onClose"): void;
  (e: "onSave"): void;
  (e: "onSaveAndClose"): void;
}

const { isOpen, title } = defineProps<IProps>();

const emit = defineEmits<IEmits>();
const { activeTab, userInfo } = useClientAddModal();

</script>

<template>
  <CreateModal
    :isOpen="isOpen"
    :title="title"
    @onClose="() => emit('onClose')"
    @onSave="() => emit('onSave')"
    @onSaveAndClose="() => emit('onSaveAndClose')"
  >
  <div class="d-flex ga-3 w-100">
      <FeatureNewClientsUiClientAddModalTabs />
      <v-tabs-window v-model="activeTab" class="w-100">
        <v-tabs-window-item
          :key="EClientTabs.profile"
          :value="EClientTabs.profile"
        >
          <FeatureNewClientsUiClientAddModalTabProfile />
        </v-tabs-window-item>
        <v-tabs-window-item
          :key="EClientTabs.contacts"
          :value="EClientTabs.contacts"
        >
          <FeatureNewClientsUiClientAddModalTabContact />
        </v-tabs-window-item>
        <v-tabs-window-item
          :key="EClientTabs.privacy"
          :value="EClientTabs.privacy"
        >
          <FeatureNewClientsUiClientAddModalTabPrivacy />
        </v-tabs-window-item>
        <v-tabs-window-item
          :key="EClientTabs.documents"
          :value="EClientTabs.documents"
        >
          <FeatureNewClientsUiClientAddModalTabDocuments />
        </v-tabs-window-item>
        <v-tabs-window-item
          :key="EClientTabs.addresses"
          :value="EClientTabs.addresses"
        >
          <FeatureNewClientsUiClientAddModalTabAddress />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </CreateModal>

</template>
