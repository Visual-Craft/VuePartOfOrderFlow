<template>
  <editor-card :title="$trans('product.separation_line.title')" @closeEditor="closeEditor">
    <template slot="body">
      <section v-if="alledoMode" class="d-flex justify-content-between align-items-center border-bottom pb-4">
        <p class="mdc-typography--body1 font--bold">{{ $trans('product.separation_line.colors') }}</p>
        <div class="color-wrapper">
          <span
            v-for="item in colors"
            :key="item"
            :class="['color-box', { selected: separationLine.color === item }]"
            :style="{ 'background-color': item }"
            @click="selectColor(item)"
          />
          <v-menu
            v-model="menu"
            content-class="menu-color"
            :close-on-content-click="false"
            :nudge-width="200"
            offset-y
            :menu-props="{ offsetY: true }"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" class="custom" v-on="on">
                <i class="v-icon custom-icon icon-adding" />
              </v-btn>
            </template>
            <v-card>
              <v-list>
                <v-list-item>
                  <v-color-picker v-model="color" dot-size="25" swatches-max-height="200" />
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </section>

      <section class="py-5">
        <p class="mdc-typography--body1 font--bold">{{ $trans('product.separation_line.library') }}</p>
      </section>
      <section>
        <div v-if="!loading" multiple class="custom">
          <div class="card-button-wrapper separation-line">
            <v-card
              v-for="item in icons"
              :key="item.id"
              :ripple="false"
              :class="['card-button custom', { selected: isSelectedIcon(item) }]"
              @click="selectIcon(item)"
            >
              <img :src="getFileUrl(item.fileReference)" :alt="item.name" />
            </v-card>
          </div>
        </div>
      </section>
    </template>
    <template slot="actions">
      <v-btn
        :disabled="(product && !product.optionActive) || process || changed"
        class="btn custom btn-type-link no-ripple pl-2"
        rounded
        @click.stop="removeProduct"
      >
        <i class="v-icon custom-icon icon-delete mr-1" />
        {{ $trans('product.cancel') }}
      </v-btn>
      <v-btn :disabled="!availableAddProduct" class="custom mb-0" color="success" rounded @click="addProduct">
        {{ $trans('product.valid') }} (+{{ showPrice(price) }})
      </v-btn>
    </template>
  </editor-card>
</template>

<script lang="ts">
import { Component, Inject, Mixins, Watch } from 'vue-property-decorator';
import { Api } from '../../../../api/alledo';
import { Routing } from '../../../../modules/globalObjects';
import { IOrder, TPublication, TSeparationLine } from '../../../../api/types';
import { showErrors } from '../../../../modules/showApiErrors';
import { SUPPORT_TYPE_ALLEDO, SEPARATION_LINE_PRODUCT } from '../../../constants/constants';
import { formatPrice } from '../../../../common/helpers';
import productMixin from '../../../mixins/productMixin';

@Component({
  components: {
    EditorCard: () => import('./EditorCard'),
  },

  computed: {
    color: {
      get() {
        return this[this.type];
      },
      set(v) {
        this[this.type] = v;
      },
    },
  },
})
export default class SeparationLine extends Mixins(productMixin) {
  @Inject('apiMode') readonly apiMode!: string;

  menu = false;

  icons: Array<TSeparationLine> | null = null;

  loading = true;

  hex: string = '#000';

  type: string = 'hex';

  colors: Array<string> = [];

  price: number | null = null;

  interval: number | null = null;

  process = false;

  changed = false;

  get availableAddProduct(): boolean {
    return !this.process && this.separationLine.icon && this.separationLine.icon.fileReference && this.changed;
  }

  get productMode(): string {
    return SEPARATION_LINE_PRODUCT;
  }

  get emptyBox(): string {
    const emptyText = this.$trans('product.separation_line.select');

    return `<div class="empty-box empty-separationLine"><p class="mdc-typography subtitle1 mb-0">${emptyText}</p></div>`;
  }

  get activateProduct(): boolean {
    return !!this.separationLine.icon && !!this.separationLine.icon.fileReference;
  }

  get newspaperPublication(): TPublication | null {
    if (this.publicationSupport === SUPPORT_TYPE_ALLEDO) {
      return null;
    }

    const { id, content, publicationType, ...updateNewspaper } = this.publicationNewspaper;
    const product = this.productsNewspaper.find((item) => item.code === SEPARATION_LINE_PRODUCT);

    return {
      ...updateNewspaper,
      attributes: {
        layout: this.contentAlign,
      },
      products: [
        {
          name: product.name,
          code: product.code,
          externalId: product.externalId,
          optionActive: this.activateProduct,
          quantity: 1,
          attributes: {
            token: this.separationLine.icon ? this.separationLine.icon.fileReference : null,
            color: this.separationLine.color,
          },
        },
      ],
    };
  }

  get alledoPublication(): TPublication {
    const { id, content, publicationType, ...updateAlledo } = this.publicationAlledo;
    const product = this.productsAlledo.find((item) => item.code === SEPARATION_LINE_PRODUCT);

    return {
      ...updateAlledo,
      attributes: {
        layout: this.contentAlign,
      },
      newspaper: {
        externalId: this.alledoXref,
        name: 'Alledo.fr',
      },
      products: [
        {
          name: product.name,
          code: product.code,
          externalId: product.externalId,
          optionActive: this.activateProduct,
          quantity: 1,
          attributes: {
            token: this.separationLine.icon ? this.separationLine.icon.fileReference : null,
            color: this.separationLine.color,
          },
        },
      ],
    };
  }

  get orderDataUpdate(): IOrder {
    const {
      id,
      token,
      keyAccount,
      adType,
      status,
      fillingType,
      netAmount,
      vatAmount,
      totalAmount,
      operator,
      creator,
      user,
      confirmationRecipient,
      familyRecipientConfirmationEmail,
      invoiceEntity,
      invoiceRecipient,
      promocode,
      promocodeDescription,
      isPaymentAllowed,
      isEditingAllowed,
      ...orderUpdate
    } = this.order;

    return {
      ...orderUpdate,
      editFinished: false,
      publications: [this.alledoPublication],
    };
  }

  @Watch('menu')
  menuHandler(value: boolean) {
    if (!value) {
      this.colors.push(this.color);
      this.$ls.set('colorPalette', this.colors, 86400000);
    }
  }

  beforeMount() {
    this.loadList();

    if (this.product && !this.product.optionActive) {
      this.$store.commit('separationLineSvg', null);
      this.$store.commit('separationLine', { icon: null, color: null });
    }
  }

  mounted(): void {
    if (this.product && this.product.unitPrice) {
      this.price = this.product.unitPrice;
    }

    this.colors = this.$ls.get('colorPalette', []);

    if (this.product && this.product.optionActive && this.product.attributes) {
      const iconObject = this.product.attributes;

      this.interval = window.setInterval(() => {
        if (this.icons && this.interval) {
          clearInterval(this.interval);
          const icon = this.icons.find((item) => item.fileReference === iconObject.token);

          if (icon) {
            this.$store.commit('separationLine', { icon, color: iconObject.color });
          }
        }
      }, 300);
    }
  }

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  selectIcon(icon: TSeparationLine) {
    this.changed = true;

    if (this.product && this.product.optionActive && this.product.attributes) {
      if (this.product.attributes.token === icon.fileReference) {
        this.changed = false;
        this.removeProduct(false);
        this.insertEmptyBox();
        this.$store.commit('separationLine', { icon: null, color: null });

        return;
      }

      this.changed = true;
      this.removeProduct(false);
      this.$store.commit('separationLine', { icon, color: this.separationLine.color });

      if (icon) {
        this.loadseparationLineSvg();
      }

      return;
    }

    if (this.separationLine.icon === icon) {
      this.changed = false;
      this.$store.commit('separationLine', { icon: null, color: null });
      this.$store.commit('separationLineSvg', null);
      this.insertEmptyBox();

      return;
    }

    this.$store.commit('separationLine', { icon, color: this.separationLine.color });

    if (icon) {
      setTimeout(() => {
        this.loadseparationLineSvg();
      }, 1000);
    }
  }

  isSelectedIcon(item: TSeparationLine): boolean {
    return this.separationLine.icon && this.separationLine.icon.id === item.id;
  }

  selectColor(color: string): void {
    if (!this.separationLine.icon) {
      return;
    }

    this.changed = true;

    const el = document.querySelector(`[data-image="${this.dataAttribute}"]`) as HTMLElement;

    if (this.separationLine.color === color) {
      this.$store.commit('separationLine', { icon: this.separationLine.icon, color: null });
      el.style.fill = '';

      return;
    }

    this.$store.commit('separationLine', { icon: this.separationLine.icon, color });
    el.style.fill = color;
  }

  loadList(): void {
    this.loading = true;
    Api[this.apiMode].files
      .separationLineList()
      .then(({ data }) => {
        this.icons = data;
        this.loading = false;
      })
      .catch(({ response: { data: errorData } }) => {
        showErrors(errorData);
      });
  }

  async loadseparationLineSvg() {
    fetch(
      `${Routing.generate(
        'alledo_file_storage_content',
        { token: this.separationLine.icon.fileReference },
        true
      )}?disposition_type=inline`
    )
      .then((response) => {
        return response.text();
      })
      .then((svg) => {
        this.$store.commit('separationLineSvg', svg);
      })
      .catch(({ response: { data: errorData } }) => {
        showErrors(errorData);
      });
  }

  removeProduct(forceCloseEditor: boolean = true): void {
    this.process = true;
    this.$store.commit('separationLineSvg', null);
    this.$store.commit('separationLine', { icon: null, color: null });

    const request = this.cobrand
      ?
        Api.cobrand.order.update(this.cobrand.slug, this.order.token, this.orderDataUpdate)
      : Api[this.apiMode].order.update(this.order.token, this.orderDataUpdate);

    request
      .then(({ data }) => {
        this.$store.commit('order', { ...this.order, ...data });
        this.$store.dispatch('getPublications');

        if (forceCloseEditor) {
          this.$store.commit('currentEditor', null);
        }
        this.process = false;
      })
      .catch(({ response: { data: errorData } }) => {
        this.process = false;

        if (forceCloseEditor) {
          this.$store.commit('currentEditor', null);
        }

        showErrors(errorData);
      });
  }

  addProduct(): void {
    this.process = true;
    Api[this.apiMode].order
      .update(this.order.token, this.orderDataUpdate)
      .then(({ data }) => {
        this.$store.commit('order', { ...this.order, ...data });
        this.$store.dispatch('getPublications');
        this.$store.commit('currentEditor', null);
        this.process = false;
      })
      .catch(({ response: { data: errorData } }) => {
        this.process = false;
        showErrors(errorData);
      });
  }

  closeEditor(): void {
    if (this.product && this.product.optionActive) {
      this.$store.commit('currentEditor', null);
    } else {
      this.$store.commit('separationLineSvg', null);
      this.$store.commit('separationLine', { icon: null, color: null });
      this.$store.commit('currentEditor', null);
    }
  }

  showPrice(price: number): string {
    return formatPrice(price);
  }
}
</script>
