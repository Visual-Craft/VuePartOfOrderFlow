<template>
  <vue-cropper
    ref="cropper"
    :view-mode="1"
    :initial-aspect-ratio="aspectRatio"
    :aspect-ratio="aspectRatio"
    :auto-crop="true"
    :auto-crop-area="0.95"
    :restore="false"
    :guides="false"
    :center="false"
    :responsive="false"
    :highlight="false"
    :natural-height="0"
    :crop-box-movable="false"
    :crop-box-resizable="false"
    :toggle-drag-mode-on-dblclick="false"
    :src="src"
    drag-mode="move"
    @cropend="$emit('changeCropped')"
    @ready="$emit('changeCropped')"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import VueCropper from 'vue-cropperjs';
import { Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
    VueCropper,
  },
})
export default class PhotoCropper extends Vue {
  @Prop({ type: String })
  src!: string;

  @Prop({ type: Number })
  aspectRatio!: number;
}
</script>
