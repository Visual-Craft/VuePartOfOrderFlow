import Vue from 'vue';
import { mapState } from 'vuex';
import { isString } from 'lodash';
import { Component, Prop, Watch } from 'vue-property-decorator';
import getConfig from '../../utils/config-reader';
import { ERoutes } from '../store/storeTypes';
import { Api } from '../../api/alledo';
import { IOrder } from '../../api/types';
import { showErrors } from '../../modules/showApiErrors';
import { showNotification } from '../../modules/notification';

@Component({
  components: {
    SelectionStep: () => import('./steps/SelectionStep.vue'),
    AnnouncementStep: () => import('./steps/Announcement.vue'),
    LayoutStep: () => import('./steps/LayoutStep.vue'),
    SummaryStep: () => import('./steps/Summary.vue'),
    StepsNavigation: () => import('@/components/stepsNavigation'),
  },

  computed: {
    ...mapState(['order', 'adType', 'currentStep', 'selectedKeyAccount', 'selectedClient']),
  },

  template: `
    <div v-if="selectedKeyAccount && canRender && allowRender">
      <steps-navigation v-if="showStepsNavigation" />
      <component :is="currentStep" />
    </div>
  `,
})
export default class App extends Vue {
  @Prop({ type: String })
  fillingType!: string;

  keyInfo: number | undefined = undefined;

  alledoXref: string | undefined = undefined;

  canRender = false;

  notDuplicate = true;

  constructor() {
    super();
    this.keyInfo = getConfig('selectedKeyAccount') as number;
    this.alledoXref = getConfig('xrefs.newspaperAlledo') as string;
  }

  @Watch('order', { immediate: true, deep: true })
  orderHandler(value: IOrder) {
    if (value.isEditingAllowed !== undefined && !value.isEditingAllowed) {
      showNotification('error', { text: this.$trans('label.b2c.main.header') });
    }
  }

  get showStepsNavigation(): boolean {
    return this.currentStep !== ERoutes.selection;
  }

  get allowRender(): boolean {
    return this.notDuplicate || !!this.adType;
  }

  created(): void {
    const store = this.$store;

    if (this.$route.query.new_order && store) {
      this.canRender = true;
      const query = { ...this.$route.query };
      delete query.new_order;
      store.dispatch('resetStoreState');
      this.$router.replace({ query }).catch(() => {});
    }

    if (this.$route.query.token && store) {
      if (this.$route.query.duplicate) {
        this.notDuplicate = false;
        const query = { ...this.$route.query };
        delete query.duplicate;
        this.$router.replace({ query }).catch(() => {});
      }
      this.$ls.remove(`${this.fillingType}`);
      this.$ls.remove(`${this.$route.query.token}`);

      store.dispatch('getOrder', this.$route.query.token).then(() => {
        this.canRender = true;
      });
    }

    if (this.keyInfo) {
      this.$appEvent.$on('selectedClient', () => {
        this.loadKeyAccount();
      });
      this.$appEvent.$on('removeSelectedClient', () => {
        this.loadKeyAccount();
      });

      this.loadKeyAccount();
    }

    if (this.alledoXref && store) {
      store.commit('setAlledoId', this.alledoXref);
    }

    if (!this.order.fillingType && store) {
      store.commit('order', { ...this.order, fillingType: this.fillingType });
    }
  }

  mounted() {
    if (this.$route.query.token && this.currentStep === ERoutes.payment && !this.$route.query.step) {
      this.$store.commit('currentStep', ERoutes.summary);
    }

    if (this.$route.query.token && this.$route.query.step) {
      const query = { ...this.$route.query };
      const key = this.$route.query.step;

      if (isString(key)) {
        this.$store.commit('currentStep', ERoutes[key]);
      }

      delete query.step;
      this.$router.replace({ query }).catch(() => {});
    }
  }

  loadKeyAccount(): void {
    if (!this.keyInfo) {
      return;
    }

    Api.b2b.keyAccount
      .getById(this.keyInfo)
      .then(({ data }) => {
        this.$store.commit('selectedKeyAccount', data);
      })
      .then(() => {
        if (!this.$route.query.token) {
          setTimeout(() => {
            this.canRender = true;
          }, 400);
        }
      })
      .catch(({ response: { data: errorData } }) => {
        showErrors(errorData);
      });
  }
}
