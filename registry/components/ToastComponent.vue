<template>
   <v-alert minWidth="350px"
    :type="typeStr[props.type||EMessageType.Info]"
    :title="props.title"
    :text="props.message"
    closable
  ></v-alert>
  </template>
  
<script setup lang="ts">

import  {EMessageType} from'~~/lib/globalTypes'

const typeStr:any={}
typeStr[EMessageType.Success]="success";
typeStr[EMessageType.Info]="info";
typeStr[EMessageType.Warn]="warning";
typeStr[EMessageType.Error]="error";

const props = defineProps ({
title: String,
message:String,
type: Number as  PropType<EMessageType>
})

var t=props.type;

</script>

  