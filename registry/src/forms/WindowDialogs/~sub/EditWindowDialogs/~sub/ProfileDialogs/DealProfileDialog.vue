<template>
  <EditWindowDialog title="Edit Deal" :on-save="save" :on-close="close" :readonly="readonly">
    <template #default="{ fieldsOptions }">
      <v-card-text>
        <!-- Basic Deal Information -->
        <v-row class="mt-1">
          <v-col xs="6" sm="6">
            <InputField :type="EDataType.string" :state="fieldsOptions" label="Title" v-model="rec!.MData.title"
              placeholder="Deal Title" required />
          </v-col>
          <v-col xs="6" sm="6">
            <InputField :type="EDataType.string" :state="fieldsOptions" label="Organization"
              v-model="rec!.MData.organization" placeholder="Organization ID" />
          </v-col>
        </v-row>

        <v-row>
          <v-col xs="6" sm="6">
            <InputField :type="EDataType.string" :state="fieldsOptions" label="Division" v-model="rec!.MData.division"
              placeholder="Division ID" />
          </v-col>
          <v-col xs="6" sm="6">
            <InputField :type="EDataType.string" :state="fieldsOptions" label="Placement" v-model="rec!.MData.placement"
              placeholder="Placement ID" />
          </v-col>
        </v-row>

        <!-- Dates -->
        <v-row>
          <v-col xs="6" sm="6">
            <InputField :state="fieldsOptions" :type="EDataType.date" label="Begin Date" v-model="rec!.MData.beginDate"
              required />
          </v-col>
          <v-col xs="6" sm="6">
            <InputField :state="fieldsOptions" :type="EDataType.date" label="End Date" v-model="rec!.MData.endDate" />
          </v-col>
        </v-row>

        <!-- Status and Payment -->
        <v-row>
          <v-col xs="6" sm="6">
            <InputField :state="fieldsOptions" :type="EDataType.strictstringarray" label="Status"
              v-model="rec!.MData.status" required />
          </v-col>
          <v-col xs="6" sm="6">
            <InputField :state="fieldsOptions" :type="EDataType.strictstringarray" label="Payment Status"
              v-model="rec!.MData.paymentStatus" />
          </v-col>
        </v-row>

        <!-- Associated Clients, Positions, and Products -->
        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Associated Clients</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row v-for="(client, index) in rec!.MData.clients" :key="index">
                <v-col xs="10">
                  <InputField :type="EDataType.strictstringarray" :state="fieldsOptions" label="Client ID"
                    v-model="rec!.MData.clients![index]" />
                </v-col>
                <v-col xs="2">
                  <v-btn icon="mdi-delete" variant="plain" size="small" @click="removeClient(index)"></v-btn>
                </v-col>
              </v-row>
              <v-btn @click="addClient" variant="text" size="small" prepend-icon="mdi-plus">
                Add Client
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Associated Positions</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row v-for="(position, index) in rec!.MData.positions" :key="index">
                <v-col xs="10">
                  <InputField :type="EDataType.strictstringarray" :state="fieldsOptions" label="Position ID"
                    v-model="rec!.MData.positions![index]" />
                </v-col>
                <v-col xs="2">
                  <v-btn icon="mdi-delete" variant="plain" size="small" @click="removePosition(index)"></v-btn>
                </v-col>
              </v-row>
              <v-btn @click="addPosition" variant="text" size="small" prepend-icon="mdi-plus">
                Add Position
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-subtitle-1">Associated Products</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row v-for="(product, index) in rec!.MData.products" :key="index">
                <v-col xs="10">
                  <InputField :type="EDataType.strictstringarray" :state="fieldsOptions" label="Product ID"
                    v-model="rec!.MData.products![index]" />
                </v-col>
                <v-col xs="2">
                  <v-btn icon="mdi-delete" variant="plain" size="small" @click="removeProduct(index)"></v-btn>
                </v-col>
              </v-row>
              <v-btn @click="addProduct" variant="text" size="small" prepend-icon="mdi-plus">
                Add Product
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </template>
  </EditWindowDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Container } from "inversify";
import EditWindowDialog from "../../EditWindowDialog.vue"
import { ERecLockArg, RecordsStore } from "~/src/common/lib/MoApi/Records/RecordsStore";
import { DealRecord } from "~/src/common/lib/MoApi/Records/DealRecord";
import { EDataType } from "~/src/common/lib/globalTypes";
import InputField from "~uibase/components/InputField.vue";
import { useEditForm, useEditFormBegin } from "../../~composables/useEditForm";
import type { IProfileDialogProps } from "./types";



const props = defineProps<IProfileDialogProps>();

const { eventsHandler, diC, recStore } = useEditFormBegin(props);

defineExpose({ eventsHandler });

const rec = ref<DealRecord>();



// Add/Remove Clients
const addClient = () => {
  if (!rec.value!.MData.clients) rec.value!.MData.clients = [];
  rec.value!.MData.clients.push("");
};

const removeClient = (index: number) => {
  rec.value!.MData.clients?.splice(index, 1);
};

// Add/Remove Positions
const addPosition = () => {
  if (!rec.value!.MData.positions) rec.value!.MData.positions = [];
  rec.value!.MData.positions.push("");
};

const removePosition = (index: number) => {
  rec.value!.MData.positions?.splice(index, 1);
};

// Add/Remove Products
const addProduct = () => {
  if (!rec.value!.MData.products) rec.value!.MData.products = [];
  rec.value!.MData.products.push("");
};

const removeProduct = (index: number) => {
  rec.value!.MData.products?.splice(index, 1);
};

// Load or create a new DealRecord
const loadFunc = async () => {
  if (props.recKey) {
    rec.value = await recStore.fetch(DealRecord, props.recKey, ERecLockArg.Try, true);
    // rec.value = (await recStore.getRecordsM([{ id: { key: props.recKey, type: DealRecord } }]))[0] as DealRecord;
  } else {
    rec.value = await recStore.createNew(DealRecord, (data) => { });
  }
  return rec;
}

// Save and Close
const saveFunc = async () => {
  await rec.value!.save();
  close();
};

const { readonly, close, save } = await useEditForm(loadFunc, saveFunc, props.readonly);


</script>

<style scoped>
.v-expansion-panels {
  z-index: auto;
}
</style>