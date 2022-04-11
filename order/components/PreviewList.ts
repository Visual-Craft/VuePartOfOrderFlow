import Vue from 'vue';
import { mapState } from 'vuex';
import { Component, Prop, Inject, Watch } from 'vue-property-decorator';

@Component({
  computed: {
    ...mapState([
      'order',
      'adType',
      'symbol',
      'symbolSvg',
      'separationLine',
      'separationLineSvg',
      'logoToken',
      'currentStep',
      'logoPreview',
      'photo',
      'photoPreview',
      'currentEditor',
      'contentAlign',
      'publicationSupport',
      'backgroundFrame',
      'cobrand',
    ]),
  },

  template: `
    <v-card class="custom card-preview">
      <div class="preview-header d-flex">
        <p class="mdc-typography--headline6 font--bold text-uppercase mb-0">{{ $trans('preview_list.title') }}</p>
        <v-btn icon
          :ripple="false"
          @click="toggleExpand">
          <v-icon aria-hidden="false" v-text="expanded ? 'expand_less' : 'expand_more'" />
        </v-btn>
      </div>
      <div v-show="expanded" class="preview-content p-0">
        <div v-if="canRender" v-html="renderTemplate.renderString(adType.template, order.template)" />
      </div>
    </v-card>
  `,
})
export default class PreviewList extends Vue {
  @Inject('apiMode') readonly apiMode!: string;

  @Prop({ type: Boolean, default: false })
  expandable!: boolean;

  @Prop({ type: Boolean, default: true })
  defaultOpened!: boolean;

  expanded = this.defaultOpened;

  canRender = false;

  get colorMode(): boolean {
    return this.publicationSupport === SUPPORT_TYPE_ALLEDO;
  }

  get svgSeparationLine(): string | null {
    if (this.currentStep === ERoutes.announcement || !this.colorMode) {
      return null;
    }

    return this.separationLineSvg;
  }

  get separationLineLink(): string | null {
    if (this.currentStep === ERoutes.announcement) {
      return null;
    }

    if (this.separationLine.icon && this.separationLine.icon.fileReference) {
      return this.getFileUrl(this.separationLine.icon.fileReference);
    }

    return null;
  }

  get renderTemplate(): any {
    return nunjucksEnv;
  }

  @Watch('adType', { immediate: true, deep: true })
  adTypeHandler(value) {
    this.canRender = !!value;
  }

  beforeMount() {
    const request = this.cobrand ? Api.cobrand.adType(this.cobrand.slug) : Api[this.apiMode].adType();

    request
        .then(({ data }) => {
          const type = data.find((item) => item.externalId === this.order.adType);

          if (type) {
            this.$store.commit('adType', type);
          }
        })
        .catch(({ response: { data: errorData } }) => {
          showErrors(errorData);
        });
  }

  getFileUrl(token: string): string {
    return Routing.generate('alledo_file_storage_content', { token }, true);
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }
}
