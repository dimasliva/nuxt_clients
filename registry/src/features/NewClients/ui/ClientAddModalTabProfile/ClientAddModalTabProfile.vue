<script lang="ts" setup>
import avatar from "~/public/doctor-test.jpg";

const {
  genders,
  userInfo,
  fileInput,
  textRules,
  handleChangeAvatarClick,
  onChangeAvatar,
  onDeleteAvatar,
} = useClientAddModalTabProfile();


</script>

<template>
  <div class="d-flex flex-column">
    <div class="mb-4">
      <div class="d-flex ga-8 align-center">
        <v-avatar color="grey" rounded="full" size="150">
          <v-img :src="userInfo.avatarPreview || avatar" cover></v-img>
        </v-avatar>
        <div class="d-flex ga-3">
          <VBtn color="primary" @click="handleChangeAvatarClick">
            {{ $t("changeAvatar") }}
          </VBtn>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onChangeAvatar"
          />
          <VBtn color="error" variant="tonal" @click="onDeleteAvatar">
            {{ $t("deleteAvatar") }}
          </VBtn>
        </div>
      </div>
    </div>

    <div class="d-flex w-100 ga-6">
      <LabelInput
        v-model:value="userInfo.name"
        :label="$t('emplName')"
        :placeholder="$t('emplName')"
        :class-name="'w-50'"
        :rules="[
          textRules.min(userInfo.name, 2),
          textRules.max(userInfo.name, 128),
          textRules.noNumbers(userInfo.name),
          textRules.noSpaces(userInfo.name),
        ]"
        required
      />

      <LabelInput
        v-model:value="userInfo.birthdate"
        :type="ELabelInput.date"
        :label="$t('birthdate')"
        :placeholder="$t('birthdate')"
        :class-name="'w-50'"
      />
    </div>
    <div class="d-flex w-100 ga-6">
      <LabelInput
        v-model:value="userInfo.surname"
        :label="$t('emplSurname')"
        :placeholder="$t('emplSurname')"
        :class-name="'w-50'"
        :rules="[
          textRules.min(userInfo.surname, 2),
          textRules.max(userInfo.surname, 128),
          textRules.noNumbers(userInfo.surname),
          textRules.noSpaces(userInfo.surname),
        ]"
        required
      />
      <LabelInput
        v-model:value="userInfo.selectedGender"
        :type="ELabelInput.select"
        :label="$t('gender')"
        :placeholder="$t('gender')"
        :selectItems="genders"
        :class-name="'w-50'"
      />
    </div>
    <div class="mb-2 d-flex w-100 ga-6">
      <LabelInput
        v-model:value="userInfo.patronymic"
        :label="$t('emplPatronymic')"
        :placeholder="$t('emplPatronymic')"
        :class-name="'w-50'"
        :rules="[
          textRules.min(userInfo.patronymic, 2),
          textRules.max(userInfo.patronymic, 128),
          textRules.noNumbers(userInfo.patronymic),
          textRules.noSpaces(userInfo.patronymic),
        ]"
      />
      <div class="w-50"></div>
    </div>
  </div>
</template>
