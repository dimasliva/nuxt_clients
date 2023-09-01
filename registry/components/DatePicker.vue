<template>
    <VueDatePicker :modelValue="modelValue" :enable-time-picker="false" model-type="yyyy-MM-dd" :locale="locale" auto-apply
        @update:modelValue="(d) => emit('update:modelValue', d)">
        <template #trigger>
            <v-text-field :modelValue="modelValue" type="date" variant="underlined" required clearable  density="compact" >
                <template v-slot:label>
                    <span>
                        {{ label || "" }} <span v-if="required" class="text-info">*</span>
                    </span>
                </template>
            </v-text-field>
        </template>
    </VueDatePicker>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { useI18n } from "vue-i18n"

const { t, locale } = useI18n();

const emit = defineEmits(['update:modelValue'])

interface IProps {
    label?: string
    modelValue: string | null | undefined
    required?: boolean
}

const props = defineProps<IProps>();


</script>