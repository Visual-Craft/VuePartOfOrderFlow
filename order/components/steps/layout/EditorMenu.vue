<template>
  <div class="card-editor-menu">
    <div class="header-card">
      <i class="v-icon custom-icon icon-idea top-icon mb-1" />
      <p class="mb-7 mdc-typography--body1 font--bold">{{ $trans('editor_menu.personnalisez') }}</p>

      <div class="align-box">
        <p class="mb-0 mdc-typography--body1">
          {{ $trans('editor_menu.align_text') }}
        </p>
        <div class="align-btn-box">
          <v-btn :class="{ selected: isAlignLeft }" @click="alignLeft">
            <v-icon>format_align_left</v-icon>
          </v-btn>
          <v-btn :class="{ selected: !isAlignLeft }" @click="alignCenter">
            <v-icon>format_align_center</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <div class="content-card">
      <v-list>
        <v-list-item-group>
          <v-list-item v-for="item in products" :key="item.code" @click="selectEditor(item.code)">
            <v-list-item-icon>
              <i class="custom-icon icon-modify v-icon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="d-flex justify-content-between">
                <span class="mdc-typography--body1">{{ $trans(item.name) }}</span>
                <span class="mdc-typography--caption1">+ {{ showPrice(item.unitPrice) }}</span>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { IProduct } from '../../../../api/types';
import {
  FONDS_EDITOR,
  FONDS_PRODUCT,
  LOGO_EDITOR,
  LOGO_PRODUCT,
  PAPER_PROOF_PRODUCT,
  PHOTO_EDITOR,
  PHOTO_PRODUCT,
  RELATION_TYPE_OPTION,
  SUPPORT_TYPE_NEWSPAPER,
  SYMBOL_EDITOR,
  SYMBOL_PRODUCT,
  SEPARATION_LINE_EDITOR,
  SEPARATION_LINE_PRODUCT,
  TEXT_ALIGN_CENTER,
  TEXT_ALIGN_LEFT,
  DIGITAL_PROOF_PRODUCT,
} from '../../../constants/constants';
import { formatPrice } from '../../../../common/helpers';

@Component({
  computed: {
    ...mapState(['productsAlledo', 'productsNewspaper', 'publicationSupport']),
  },
})
export default class EditorMenu extends Vue {
  @Inject('apiMode') readonly apiMode!: string;

  @Prop({ type: Boolean })
  isOpen!: boolean;

  @Prop({ type: String, default: TEXT_ALIGN_LEFT })
  textAlign!: string;

  get isAlignLeft(): boolean {
    return this.textAlign === TEXT_ALIGN_LEFT;
  }

  get products(): Array<IProduct> {
    if (this.publicationSupport === SUPPORT_TYPE_NEWSPAPER) {
      if (this.apiMode === 'b2c') {
        return this.productsNewspaper.filter(
          (item) =>
            item.relationType === RELATION_TYPE_OPTION &&
            item.code !== PAPER_PROOF_PRODUCT &&
            item.code !== DIGITAL_PROOF_PRODUCT &&
            RELATION_TYPE_OPTION &&
            item.code !== LOGO_PRODUCT &&
            item.code !== SEPARATION_LINE_PRODUCT &&
            item.code !== FONDS_PRODUCT
        );
      }

      return this.productsNewspaper.filter(
        (item) =>
          item.relationType === RELATION_TYPE_OPTION &&
          item.code !== PAPER_PROOF_PRODUCT &&
          item.code !== DIGITAL_PROOF_PRODUCT &&
          item.code !== SEPARATION_LINE_PRODUCT &&
          item.code !== FONDS_PRODUCT
      );
    }

    if (this.apiMode === 'b2c') {
      return this.productsAlledo.filter(
        (item) =>
          item.relationType === RELATION_TYPE_OPTION &&
          item.code !== PAPER_PROOF_PRODUCT &&
          item.code !== DIGITAL_PROOF_PRODUCT &&
          RELATION_TYPE_OPTION &&
          item.code !== LOGO_PRODUCT
      );
    }

    return this.productsAlledo.filter(
      (item) =>
        item.relationType === RELATION_TYPE_OPTION &&
        item.code !== PAPER_PROOF_PRODUCT &&
        item.code !== DIGITAL_PROOF_PRODUCT
    );
  }

  selectEditor(value: string): void {
    const editor = this.getComponentName(value);

    if (editor) {
      this.$store.commit('currentEditor', editor);
    }
  }

  getComponentName(value: string): string | null {
    switch (value) {
      case SYMBOL_PRODUCT:
        return SYMBOL_EDITOR;
      case LOGO_PRODUCT:
        return LOGO_EDITOR;
      case PHOTO_PRODUCT:
        return PHOTO_EDITOR;
      case SEPARATION_LINE_PRODUCT:
        return SEPARATION_LINE_EDITOR;
      case FONDS_PRODUCT:
        return FONDS_EDITOR;
      default:
        return null;
    }
  }

  alignLeft(): void {
    this.$store.commit('contentAlign', TEXT_ALIGN_LEFT);
  }

  alignCenter(): void {
    this.$store.commit('contentAlign', TEXT_ALIGN_CENTER);
  }

  showPrice(price: number): string {
    return formatPrice(price);
  }
}
</script>
