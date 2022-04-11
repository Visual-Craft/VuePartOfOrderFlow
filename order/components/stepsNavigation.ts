import Vue from 'vue';
import { mapState } from 'vuex';
import { Component, Watch } from 'vue-property-decorator';
import { ERoutes } from '../store/storeTypes';
import { Routing } from '../../modules/globalObjects';

@Component({
  components: {
    CloseOrderDialog: () => import('./CloseOrderDialog.vue'),
  },

  computed: {
    ...mapState(['order', 'currentStep']),
  },

  template: `
    <div class="steps-bar">
      <ul>
        <li @click.stop.prevent="toStepAnnouncement">
          <div :class="['c100', 'small', announcementClass, {complete: isLayoutAvailable}]">
            <span>1</span>
            <div class="slice">
              <div class="bar"></div>
              <div class="fill"></div>
            </div>
          </div>
          <span class="mdc-typography--body1 high-emphasis text-uppercase font-weight-bold">{{
            $trans('step.redaction')
          }}</span>
        </li>
        <li @click.stop.prevent="toStepLayout">
          <div :class="['c100', 'small', layoutClass, {disabled: !isLayoutAvailable, complete: isSummaryAvailable}]">
            <span>2</span>
            <div class="slice">
              <div class="bar"></div>
              <div class="fill"></div>
            </div>
          </div>
          <span class="mdc-typography--body1 high-emphasis text-uppercase font-weight-bold">{{
            $trans('step.mise_en_page')
          }}</span>
        </li>
        <li>
          <div :class="['c100', 'small', summaryClass, {disabled: !isSummaryAvailable}]">
            <span>3</span>
            <div class="slice">
              <div class="bar"></div>
              <div class="fill"></div>
            </div>
          </div>
          <span class="mdc-typography--body1 high-emphasis text-uppercase font-weight-bold">{{
            $trans('step.recapitulatif')
          }}</span>
        </li>
        <li>
          <div class="c100 disabled small">
            <span>4</span>
            <div class="slice">
              <div class="bar"></div>
              <div class="fill"></div>
            </div>
          </div>
          <span class="mdc-typography--body1 high-emphasis text-uppercase font-weight-bold">{{
            $trans('step.paiement')
          }}</span>
        </li>
      </ul>
      <a href="#" class="steps-bar__close medium-emphasis text-decoration-none -modal" @click.prevent="showConfirmCloseDialog">
        <i class="material-icons" tabindex="-1" role="button">close</i>
      </a>
      <close-order-dialog :show="showDialog" @confirm="confirmClose" @close="showDialog = false" />
    </div>
  `,
})
export default class StepsNavigation extends Vue {
  announcementClass: string | null = null;

  layoutClass: string | null = null;

  summaryClass: string | null = null;

  showDialog = false;

  get isLayoutAvailable(): boolean {
    return this.currentStep !== ERoutes.announcement;
  }

  get isSummaryAvailable(): boolean {
    return this.currentStep !== ERoutes.announcement && this.currentStep !== ERoutes.layout;
  }

  @Watch('currentStep', { immediate: true })
  currentStepHandler(value) {
    if (value !== ERoutes.announcement) {
      this.announcementClass = 'p100';
    }

    if (value === ERoutes.announcement) {
      this.layoutClass = null;
      this.summaryClass = null;
    }

    if (value === ERoutes.layout) {
      this.layoutClass = 'p75';
      this.summaryClass = null;
    }

    if (value === ERoutes.summary) {
      this.summaryClass = 'p75';
      this.layoutClass = 'p100';
    }
  }

  toStepAnnouncement(): void {
    this.$store.dispatch('goToStep', ERoutes.announcement);
  }

  toStepLayout(): void {
    if (this.isLayoutAvailable) {
      if (this.currentStep === ERoutes.layout) {
        this.$store.commit('currentEditor', null);
      }
      this.$store.dispatch('goToStep', ERoutes.layout);
    }
  }

  confirmClose(): void {
    const url = Routing.generate('alledo_b2b_section_dashboard', {}, true);

    if (url) {
      window.location.href = url;
    }
  }

  showConfirmCloseDialog(): void {
    this.showDialog = true;
  }
}
