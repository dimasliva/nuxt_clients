<script lang="ts" setup>
import { ELabelInput } from "~/src/widgets/LabelInput/model/types/labelInput";
import { useClientAddModalTabDocuments } from "../../model/hooks/useClientAddModalTabDocuments";

const {
  documents,
  seria,
  number,
  date,
  comment,
  addedItems,
  selectType,
  headers,
  removeDocument,
  addInputs,
  t,
} = useClientAddModalTabDocuments();
</script>

<template>
  <div class="d-flex flex-column justify-space-between align-end h-100">
    <div class="w-100">
      <div class="d-flex flex-column w-100">
        <div class="d-flex ga-3">
          <div class="d-flex flex-column w-50">
            <LabelInput
              v-model:value="seria"
              :label="$t('seria')"
              :placeholder="$t('seria')"
              :class-name="'w-100'"
            />
            <LabelInput
              v-model:value="number"
              :label="$t('number')"
              :placeholder="$t('number')"
              :class-name="'w-100'"
            />
          </div>
          <div class="d-flex w-50 flex-column">
            <LabelInput
              :type="ELabelInput.select"
              :selectItems="addedItems"
              :label="$t('document')"
              :placeholder="$t('document')"
              :class-name="'w-100'"
              v-model:value="selectType"
            />
            <LabelInput
              :type="ELabelInput.date"
              :label="$t('issueDate')"
              :placeholder="$t('issueDate')"
              :class-name="'w-100'"
              v-model:value="date"
            />
          </div>
        </div>
        <LabelInput
          :label="$t('comment')"
          :placeholder="$t('comment')"
          :class-name="'w-100'"
          v-model:value="comment"
        />
      </div>
    </div>
    <VBtn @click="addInputs" class="w-100">{{ t("add") }}</VBtn>

    <div class="mt-4 w-100">
      <v-table height="300px" fixed-header>
        <thead>
          <tr>
            <th class="text-left">
              {{ $t("number") }}
            </th>
            <th>
              {{ $t("seria") }}
            </th>
            <th>
              {{ $t("issueDate") }}
            </th>
            <th class="text-left">
              {{ $t("comment") }}
            </th>
            <th class="text-right">
              {{ $t("do") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in documents" :key="item.id">
            <td>{{ item.seria }}</td>
            <td>{{ item.number }}</td>
            <td>{{ item.date }}</td>
            <td class="comment-cell">{{ item.comment }}</td>
            <td class="text-right">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" class="cursor-pointer">mdi-dots-vertical</v-icon>
                </template>
                <v-list>
                  <v-list-item>
                    <v-list-item-title class="cursor-pointer">
                      <div class="text-red" @click="removeDocument(item.id)">
                        {{ $t("delete") }}
                      </div>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>
