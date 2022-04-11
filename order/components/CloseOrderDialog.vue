<template>
  <v-dialog v-model="show" max-width="600" content-class="custom" @click:outside="$emit('close')">
    <v-card class="bg--white">
      <v-card-text>
        <div class="row">
          <div class="col-12">
            <p class="mdc-typography--body2 font--bold mb-0">
              {{ $trans('title.modal.lp.publication.returnpage') }}
            </p>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pb-0">
        <div class="row">
          <div class="col centered justify-content-end">
            <v-btn class="mdc-button-custom mdc-button ml-3" text @click.prevent="$emit('confirm')">
              {{ $trans('label.modal.lp.publication.btn.exit') }}
            </v-btn>
            <v-btn class="mdc-button-custom mdc-button" text @click.prevent="$emit('close')">
              {{ $trans('label.modal.lp.publication.btn.continue') }}
            </v-btn>
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class CloseOrderDialog extends Vue {
  @Prop({ type: Boolean, default: false })
  show!: boolean;
}
</script>
