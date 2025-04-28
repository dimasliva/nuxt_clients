<script lang="ts" setup>
import "@vuepic/vue-datepicker/dist/main.css";
import { EClientTabs } from "../../model/types/clients";

interface IProps {
  isOpen: boolean;
}

interface IEmits {
  (e: "onClose"): void;
  (e: "onSave"): void;
  (e: "onSaveAndClose"): void;
  (e: "onAdd"): void;
  (e: "onAddAndClose"): void;
}

const { isOpen } = defineProps<IProps>();

const emit = defineEmits<IEmits>();
const { activeTab, openUserId, getIsUserInfoChanged } = useClientAddModal();
</script>

<template>
  <CreateModal
    :isOpen="isOpen"
    :title="$t('clientProfile')"
    :addTitle="$t('createClient')"
    :isAdd="openUserId === '-1'"
    :isDisableSave="!getIsUserInfoChanged"
    @onClose="() => emit('onClose')"
    @onSave="() => emit('onSave')"
    @onSaveAndClose="() => emit('onSaveAndClose')"
    @onAdd="() => emit('onAdd')"
    @onAddAndClose="() => emit('onAddAndClose')"
  >
    <div class="d-flex ga-3 w-100">
      <v-tabs v-model="activeTab" color="primary" direction="vertical">
        <v-tab
          prepend-icon="mdi-account"
          :text="$t('phofile')"
          :value="EClientTabs.profile"
        ></v-tab>
        <v-tab
          prepend-icon="mdi-contacts"
          :text="$t('contacts')"
          :value="EClientTabs.contacts"
        ></v-tab>
        <v-tab
          prepend-icon="mdi-lock"
          :text="$t('identityDocument')"
          :value="EClientTabs.privacy"
        ></v-tab>
        <v-tab
          prepend-icon="mdi-text-box-multiple"
          :text="$t('otherDocuments')"
          :value="EClientTabs.documents"
        ></v-tab>
        <v-tab
          prepend-icon="mdi-map-marker"
          :text="$t('addresses')"
          :value="EClientTabs.addresses"
        ></v-tab>
      </v-tabs>
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
