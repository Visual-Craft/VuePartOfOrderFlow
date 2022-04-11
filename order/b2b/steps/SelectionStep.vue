<template>
  <div v-if="availableOrderModes.length" class="container-fluid">
    <div class="row">
      <div class="col-12">
        <h1 class="mdc-typography--headline1 mt-6">
          {{ $trans('selection_step.title') }}
        </h1>
        <p class="mt-7 mb-4 text-center mdc-typography--headline3 font-weight-bold">
          {{ $trans('selection_step.sub_title') }}
        </p>
        <div class="container">
          <div class="row mx-n2">
            <div v-for="(item, index) in availableOrderModes" :key="index" class="col-4 col-md-4 col-lg-3 px-2">
              <v-card
                :class="[
                  'custom card-order',
                  {
                    selected: isSelected(item),
                  },
                ]"
                outlined
                @click.native.prevent="selectAdType(item)"
              >
                <v-icon class="card-arrow-icon">arrow_forward</v-icon>
                <v-icon class="card-arrow-icon active" color="#68DD8E">check_circle</v-icon>
                <div class="card-content">
                  <div class="mdc-typography--headline5 font-weight-bold">
                    {{ $trans(item.name) }}
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <select-support v-if="order.adType" ref="selectSupport" />
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { Component, Mixins } from 'vue-property-decorator';
import orderModes from '../../mixins/orderModes';
import { TAdType } from '../../../api/types';

@Component({
  components: {
    SelectSupport: () => import('@/components/steps/selection/SelectSupport.vue'),
  },

  computed: {
    ...mapState(['order']),
  },
})
export default class SelectionStep extends Mixins(orderModes) {
  mounted() {
    this.scrollToSupportWrapper(1000);
  }

  selectAdType(type: TAdType): void {
    if (this.order.token) {
      return;
    }

    if (this.isSelected(type)) {
      this.$store.commit('order', { ...this.order, adType: null });
      this.$store.commit('publicationSupport', null);

      return;
    }

    this.$store.commit('order', { ...this.order, adType: type.externalId });
    this.$store.commit('adType', type);
    this.scrollToSupportWrapper();
  }

  isSelected(item: TAdType): boolean {
    return this.order.adType && this.order.adType === item.externalId;
  }

  scrollToSupportWrapper(timeout: number = 300): void {
    setTimeout(() => {
      const selectSupport = this.$refs.selectSupport as SelectSupport;

      if (selectSupport) {
        (selectSupport.$refs.supportWrapper as HTMLElement).scrollIntoView({ behavior: 'smooth' });
      }
    }, timeout);
  }
}
</script>
