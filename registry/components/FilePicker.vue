<template>
    <div>
        <!-- 1. Create the button that will be clicked to select a file -->
        <slot :openFileDialog="handleFileImport" :loading="isSelecting">
            <v-btn v-bind="$attrs"  :loading="isSelecting"  @click="handleFileImport"/>
        </slot>

        <!-- Create a File Input that will be hidden but triggered with JavaScript -->
        <input ref="refUploader" class="d-none" type="file" @change="onFileChanged" :accept="accept">
    </div>
</template>



<script setup lang="ts">

defineOptions({
  inheritAttrs: false,
  customOptions: {}
})

const emit = defineEmits(['onFileSelect'])


interface IProps {
    accept?: string;
}

const props = defineProps<IProps>();


const selectedFile = ref();
const isSelecting = ref(false);
const refUploader = ref();


const handleFileImport = () => {
    isSelecting.value = true;

    // After obtaining the focus when closing the FilePicker, return the button state to normal
    window.addEventListener('focus', () => {
        isSelecting.value = false
    }, { once: true });

    // Trigger click on the FileInput
    refUploader.value.click();
};


const onFileChanged = (e) => {
    selectedFile.value = e.target.files[0];
    emit("onFileSelect", selectedFile.value);
};

</script>