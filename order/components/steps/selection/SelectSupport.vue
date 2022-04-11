<template>
  <div ref="supportWrapper" class="row justify-center mb--200">
    <div class="col-12">
      <h1 class="text-center mdc-typography--headline3 high-emphasis font-weight-bold mb-1">
        {{ $trans('select_support.title') }}
      </h1>
    </div>
    <div class="col-12 col-md-6 col-lg-3 col-fix">
      <flow-alledo
        :selected="isAlledoSupport"
        :disabled="isNewspaperSupport"
        @toggleSelect="selectSupport(SUPPORT_TYPE_ALLEDO)"
        @next="nextStep"
      />
    </div>
    <div class="col-12 col-md-6 col-lg-3 col-fix">
      <flow-newspaper
        :selected="isNewspaperSupport"
        :disabled="isAlledoSupport"
        @toggleSelect="selectSupport(SUPPORT_TYPE_NEWSPAPER)"
        @next="nextStep"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Provide } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { SUPPORT_TYPE_NEWSPAPER, SUPPORT_TYPE_ALLEDO } from '../../../constants/constants';
import { ERoutes } from '../../../store/storeTypes';
import { Api } from '../../../../api/alledo';
import { TProvideDepartments } from '../../../../api/types';
import { showErrors } from '../../../../modules/showApiErrors';

@Component({
  components: {
    FlowNewspaper: () => import('./FlowNewspaper.vue'),
    FlowAlledo: () => import('./FlowAlledo.vue'),
  },

  computed: {
    ...mapState(['order', 'publicationSupport', 'currentStep', 'startedFlow']),
  },
})
export default class SelectSupport extends Vue {
  departments: TProvideDepartments = { value: null };

  SUPPORT_TYPE_NEWSPAPER = SUPPORT_TYPE_NEWSPAPER;

  SUPPORT_TYPE_ALLEDO = SUPPORT_TYPE_ALLEDO;

  @Provide() departmentList = this.departments;

  get isNewspaperSupport(): boolean {
    return this.publicationSupport && this.publicationSupport === SUPPORT_TYPE_NEWSPAPER;
  }

  get isAlledoSupport(): boolean {
    return this.publicationSupport && this.publicationSupport === SUPPORT_TYPE_ALLEDO;
  }

  mounted(): void {
    this.getDepartments();
  }

  selectSupport(value: string): void {
    if (this.startedFlow) {
      return;
    }

    if (value === this.publicationSupport) {
      this.$store.commit('publicationSupport', null);
    } else {
      this.$store.commit('publicationSupport', value);
    }
  }

  nextStep(): void {
    const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
    setTimeout(() => {
      window.scrollTo({
        top: -currentScroll,
        behavior: 'smooth',
      });
    }, 300);
    this.$store.dispatch('goToStep', ERoutes.announcement);
    this.$store.commit('startFlow');
  }

  getDepartments(): void {
    Api.b2b.department.list().then(({ data }) => {
      this.departments.value = data.map((item) => {
        return { ...item, label: `${item.name} (${item.code})` };
      });
    })
    .catch(({ response: { data: errorData } }) => {
      showErrors(errorData);
    });
  }
}
</script>
