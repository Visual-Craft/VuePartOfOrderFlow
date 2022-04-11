<template>
  <editor-card :title="$trans('product.photo.title')" @closeEditor="close">
    <template slot="body">
      <section :class="['pb-5', 'mb-5', { 'border-bottom': uploadedImage }]">
        <p class="mdc-typography--body1 font--bold mb-2">{{ $trans('product.photo.name') }}</p>

        <div class="add-product-wrapper">
          <div class="add-photo-box position-relative">
            <v-icon v-if="photo.token" @click="removeProduct(false)">close</v-icon>
            <div
              v-if="!photo.token"
              :class="['photo-fileArea', 'input-file', { 'd-none': uploadedImage }]"
              @dragover.prevent
              @drop.stop.prevent="setImage"
            >
              <input id="file" type="file" class="custom" accept="image/png, image/jpeg" @change="setImage" />
              <div class="input-file-content">
                <i class="v-icon custom-icon icon-import" />
                <span>{{ $trans('product.photo.description') }}</span>
              </div>
            </div>

            <div v-if="photo.token" :class="['photo-preview', photoBorder, photoEffect, photoShape]">
              <img :src="getFileUrl(photo.token)" alt="photo" />
            </div>
          </div>
        </div>

        <div v-if="uploadedImage && !photo.token" :class="['photo-cropper', photoShape]">
          <photo-cropper
            v-show="isSquareCropper"
            ref="cropper"
            :aspect-ratio="1"
            :src="uploadedImage"
            @changeCropped="changeCropped"
          />

          <photo-cropper
            v-show="!isSquareCropper"
            ref="cropperEllipse"
            :aspect-ratio="0.5"
            :src="uploadedImage"
            @changeCropped="changeCropped"
          />
        </div>
        <div v-if="uploadedImage" class="text-center">
          <label
            for="file"
            class="mx-auto mt-3 cursor-pointer custom text-uppercase v-btn v-btn--outlined theme--light v-size--default"
            @click="chooseHandler"
          >
            {{ $trans('product.photo.select_photo') }}
          </label>
        </div>
      </section>

      <template v-if="alledoMode">
        <section v-if="uploadedImage" class="border-bottom pb-5 mb-5">
          <p class="mdc-typography--body1 font--bold mb-3">{{ $trans('product.photo.shape') }}</p>

          <div class="card-button-wrapper">
            <div
              :class="['crop-square', 'shape-btn', { selected: photoShape === EPhotoShape.square }]"
              @click="crop(EPhotoShape.square)"
            />
            <div
              :class="['crop-square-round', 'shape-btn', { selected: photoShape === EPhotoShape.squareRound }]"
              @click="crop(EPhotoShape.squareRound)"
            />
            <div
              :class="['crop-portrait', 'shape-btn', { selected: photoShape === EPhotoShape.portrait }]"
              @click="crop('portrait')"
            />
            <div
              :class="['crop-portrait-round', 'shape-btn', { selected: photoShape === EPhotoShape.portraitRound }]"
              @click="crop(EPhotoShape.portraitRound)"
            />
            <div
              :class="['crop-ellipse', 'shape-btn', { selected: photoShape === EPhotoShape.ellipse }]"
              @click="crop(EPhotoShape.ellipse)"
            />
            <div
              :class="['crop-circle', 'shape-btn', { selected: photoShape === EPhotoShape.circle }]"
              @click="crop(EPhotoShape.circle)"
            />
          </div>
        </section>
        <section v-if="uploadedImage" class="border-bottom pb-5 mb-5">
          <p class="mdc-typography--body1 font--bold mb-3">{{ $trans('product.photo.border') }}</p>

          <div class="card-button-wrapper">
            <div :class="['border-btn', 'solid-border', borderClass]">
              <div
                :class="['shape-btn', { selected: photoBorder === EPhotoBorder.solid }]"
                @click="setBorder(EPhotoBorder.solid)"
              />
            </div>
            <div :class="['border-btn', 'double-border', borderClass]">
              <div
                :class="['shape-btn', { selected: photoBorder === EPhotoBorder.double }]"
                @click="setBorder(EPhotoBorder.double)"
              />
            </div>
            <div :class="['border-btn', 'dashed-border', borderClass]">
              <div
                :class="['shape-btn', { selected: photoBorder === EPhotoBorder.dashed }]"
                @click="setBorder(EPhotoBorder.dashed)"
              />
            </div>
            <div :class="['border-btn', 'double-dashed-border', borderClass]">
              <div
                :class="['shape-btn', { selected: photoBorder === EPhotoBorder.doubleDashed }]"
                @click="setBorder(EPhotoBorder.doubleDashed)"
              />
            </div>
          </div>
        </section>
        <section v-if="uploadedImage" class="border-bottom pb-5 mb-5">
          <p class="mdc-typography--body1 font--bold mb-3">{{ $trans('product.photo.filters') }}</p>

          <div class="card-button-wrapper">
            <div class="text-center">
              <div :class="['filter-btn', borderClass]">
                <div
                  :class="['shape-btn', { selected: photoEffect === EPhotoEffect.normal }]"
                  :style="filterButtonStyles"
                  @click="setFilter(EPhotoEffect.normal)"
                />
              </div>
              <p>{{ $trans('product.photo.filters.normal') }}</p>
            </div>

            <div class="text-center">
              <div :class="['filter-btn', 'black-white', borderClass]">
                <div
                  :class="['shape-btn', { selected: photoEffect === EPhotoEffect.blackWhite }]"
                  :style="filterButtonStyles"
                  @click="setFilter(EPhotoEffect.blackWhite)"
                />
              </div>
              <p>{{ $trans('product.photo.filters.nb') }}</p>
            </div>

            <div class="text-center">
              <div :class="['filter-btn', 'sepia', borderClass]">
                <div
                  :class="['shape-btn', { selected: photoEffect === EPhotoEffect.sepia }]"
                  :style="filterButtonStyles"
                  @click="setFilter(EPhotoEffect.sepia)"
                />
              </div>
              <p>{{ $trans('product.photo.filters.sepia') }}</p>
            </div>

            <div class="text-center">
              <div :class="['filter-btn', 'contrast', borderClass]">
                <div
                  :class="['shape-btn', { selected: photoEffect === EPhotoEffect.contrast }]"
                  :style="filterButtonStyles"
                  @click="setFilter(EPhotoEffect.contrast)"
                />
              </div>
              <p>{{ $trans('product.photo.filters.contrast') }}</p>
            </div>

            <div class="text-center">
              <div :class="['filter-btn', 'vintage', borderClass]">
                <div
                  :class="['shape-btn', { selected: photoEffect === EPhotoEffect.vintage }]"
                  :style="filterButtonStyles"
                  @click="setFilter(EPhotoEffect.vintage)"
                />
              </div>
              <p>{{ $trans('product.photo.filters.vintage') }}</p>
            </div>
          </div>
        </section>
      </template>
    </template>
    <template slot="actions">
      <v-btn
        :disabled="(product && !product.optionActive) || process"
        class="btn custom btn-type-link no-ripple pl-2"
        rounded
        @click="removeProduct"
      >
        <i class="v-icon custom-icon icon-delete" />
        {{ $trans('product.cancel') }}
      </v-btn>
      <v-btn :disabled="!availableAddProduct" class="custom mb-0" color="success" rounded @click="addProduct">
        {{ $trans('product.valid') }} (+4)
      </v-btn>
    </template>
  </editor-card>
</template>

<script lang="ts">
import { Component, Inject, Mixins, Watch } from 'vue-property-decorator';
import { showNotification } from '../../../../modules/notification';
import productMixin from '../../../mixins/productMixin';
import { PHOTO_PRODUCT, SUPPORT_TYPE_NEWSPAPER, SUPPORT_TYPE_ALLEDO } from '../../../constants/constants';
import { EPhotoBorder, EPhotoEffect, EPhotoShape, IOrder, IOrderB2c, TPublication } from '../../../../api/types';
import { formatBytes } from '../../../../common/helpers';
import { Api } from '../../../../api/alledo';
import { showErrors } from '../../../../modules/showApiErrors';
import PhotoCropper from './PhotoCropper.vue';

@Component({
  components: {
    EditorCard: () => import('./EditorCard'),
    PhotoCropper: () => import('./PhotoCropper.vue'),
  },
})
export default class Photo extends Mixins(productMixin) {
  @Inject('apiMode') readonly apiMode!: string;

  uploadedImage: string | null = null;

  process = false;

  photoShape: EPhotoShape = EPhotoShape.square;

  photoBorder = '';

  photoEffect: string = EPhotoEffect.normal;

  EPhotoShape = EPhotoShape;

  EPhotoBorder = EPhotoBorder;

  EPhotoEffect = EPhotoEffect;

  get availableAddProduct(): boolean {
    return !this.process && (!!this.file || !!this.photoPreview);
  }

  get emptyBox(): string {
    const emptyText = this.$trans('product.photo.select_text');

    return `<div class="empty-box empty-photo"><i class="v-icon custom-icon icon-import"></i> <span>${emptyText}</span></div>`;
  }

  get productMode(): string {
    return PHOTO_PRODUCT;
  }

  get isSquareCropper(): boolean {
    return [EPhotoShape.square, EPhotoShape.squareRound, EPhotoShape.circle].includes(this.photoShape);
  }

  get borderClass(): string {
    return `crop-${this.photoShape}`;
  }

  get photoLink(): string {
    let link = '';

    if (this.photo.token) {
      link = this.getFileUrl(this.photo.token);
    }

    if (this.photoPreview) {
      link = URL.createObjectURL(this.photoPreview);
    }

    return link;
  }

  get filterButtonStyles(): string {
    return `background-image: url(${this.photoLink}); background-position: center; background-repeat: no-repeat;`;
  }

  get newspaperPublication(): TPublication | null {
    if (this.publicationSupport === SUPPORT_TYPE_ALLEDO) {
      return null;
    }

    const { id, content, publicationType, ...updateNewspaper } = this.publicationNewspaper;
    const product = this.productsNewspaper.find((item) => item.code === PHOTO_PRODUCT);

    return {
      ...updateNewspaper,
      products: [
        {
          name: product.name,
          code: product.code,
          externalId: product.externalId,
          optionActive: !!this.photo.token,
          quantity: 1,
          attributes: {
            token: this.photo.token,
            shape: this.photoShape,
            border: this.photoBorder,
            filter: this.photoEffect,
          },
        },
      ],
    };
  }

  get alledoPublication(): TPublication {
    const { id, content, publicationType, ...updateAlledo } = this.publicationAlledo;
    const product = this.productsAlledo.find((item) => item.code === PHOTO_PRODUCT);

    return {
      ...updateAlledo,
      newspaper: {
        externalId: this.alledoXref,
        name: 'Alledo.fr',
      },
      products: [
        {
          name: product.name,
          code: product.code,
          externalId: product.externalId,
          optionActive: !!this.photo.token,
          quantity: 1,
          attributes: {
            token: this.photo.token,
            shape: this.photoShape,
            border: this.photoBorder,
            filter: this.photoEffect,
          },
        },
      ],
    };
  }

  get publicationsUpdate(): Array<TPublication> {
    if (this.publicationSupport === SUPPORT_TYPE_NEWSPAPER && this.newspaperPublication) {
      return [this.newspaperPublication];
    }

    return [this.alledoPublication];
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
      publications: this.publicationsUpdate,
    };
  }

  @Watch('photoShape')
  photoShapeHandler() {
    const square = this.$refs.cropper as PhotoCropper;
    const round = this.$refs.cropperEllipse as PhotoCropper;

    if (square) {
      (square.$refs.cropper as PhotoCropper).replace(this.uploadedImage);
    }

    if (round) {
      (round.$refs.cropper as PhotoCropper).replace(this.uploadedImage);
    }
  }

  beforeMount() {
    if (this.product && this.product.optionActive && this.product.attributes) {
      this.photoShape = this.product.attributes.shape ?? EPhotoShape.square;
      this.photoBorder = this.product.attributes.border ?? null;
      this.photoEffect = this.product.attributes.filter ?? EPhotoEffect.normal;
    } else {
      this.$store.commit('photo', {
        token: null,
        shape: this.photoShape,
        border: this.photoBorder,
        filter: this.photoEffect,
      });
    }
  }

  setBorder(value: string): void {
    if (this.photoBorder === value) {
      this.photoBorder = '';
      this.$store.commit('photo', { ...this.photo, border: null });

      return;
    }

    this.photoBorder = value;
    this.$store.commit('photo', { ...this.photo, border: value });
  }

  setFilter(value: string): void {
    if (this.photoEffect === value) {
      this.photoEffect = EPhotoEffect.normal;
      this.$store.commit('photo', { ...this.photo, filter: EPhotoEffect.normal });

      return;
    }

    this.photoEffect = value;
    this.$store.commit('photo', { ...this.photo, filter: value });
  }

  chooseHandler(): void {
    if (this.product && this.product.optionActive) {
      this.clearImage();
    }
  }

  crop(shape: EPhotoShape): void {
    this.photoShape = shape;
    this.$store.commit('photo', { ...this.photo, shape });

    if (this.isSquareCropper) {
      this.changeCropped();

      return;
    }

    this.changeCropped(82);
  }

  setImage(e: any): void {
    let file;

    if (e.type === 'change') {
      file = e.target.files[0];
    } else if (e.type === 'drop') {
      file = e.dataTransfer.files[0];
    }

    const fileTypes = ['jpg', 'jpeg', 'png'];
    const fileValue = file ? file.name.split('.').pop().toLowerCase() : '';
    const isSuccess = fileTypes.indexOf(fileValue) > -1;

    if (file && file.size > 3145728) {
      showNotification('error', { text: this.$trans('image_error.size', { size: formatBytes(file.size) }) });

      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && isSuccess) {
        const image = new Image();
        image.src = reader.result as string;

        image.onload = (event: any) => {
          const img = event.path || ((event.composedPath && event.composedPath()) as HTMLImageElement);
          const height = img[0].naturalHeight;
          const width = img[0].naturalWidth;

          if (height < 400 || width < 400) {
            if (height < 400) {
              showNotification('error', { text: this.$trans('image_error.min_height', { height }) });
            }

            if (width < 400) {
              showNotification('error', { text: this.$trans('image_error.min_width', { width }) });
            }

            return false;
          }

          this.uploadedImage = image.src;

          const square = this.$refs.cropper as PhotoCropper;
          const round = this.$refs.cropperEllipse as PhotoCropper;

          if (square) {
            (square.$refs.cropper as PhotoCropper).replace(image.src);
          }

          if (round) {
            (round.$refs.cropper as PhotoCropper).replace(image.src);
          }

          return true;
        };
      } else {
        showNotification('error', { text: this.$trans('label.filetype.invalid') });
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      this.clearImage();
    }
  }

  clearImage(): void {
    if (this.uploadedImage) {
      this.removeProduct();
    }

    this.$store.commit('photo', { token: null });
    this.$store.commit('photoPreview', null);
    this.insertEmptyBox();
  }

  changeCropped(width: number = 164): void {
    const cropper = !this.isSquareCropper
      ? (this.$refs.cropperEllipse as PhotoCropper)
      : (this.$refs.cropper as PhotoCropper);

    if (cropper && cropper.$refs.cropper) {
      setTimeout(() => {
        (cropper.$refs.cropper as PhotoCropper).getCroppedCanvas({ width }).toBlob((blob) => {
          this.$store.commit('photoPreview', blob);
        });
      }, 100);
    }
  }

  addProduct(): void {
    const formData = new FormData();
    this.process = true;

    formData.append('type', 'photo');
    formData.append('file', this.photoPreview);

    Api[this.apiMode].files
      .upload(formData)
      .then(({ data }) => {
        this.$store.commit('photo', { ...this.photo, token: data.token });
        this.$store.commit('photoPreview', null);
      })
      .then(() => {
        this.updateOrder();
      })
      .catch(({ response: { data: errorData } }) => {
        showErrors(errorData);
      });
  }

  deleteFilePhoto(): void {
    this.process = true;

    if (this.photo.token) {
      this.process = false;
      this.$store.commit('photo', { ...this.photo, token: null });
      this.$store.commit('photoPreview', null);
      this.insertEmptyBox();

      this.process = false;

      return;
    }

    this.uploadedImage = null;
    this.process = false;
  }

  removeProduct(closeAfterRemove: boolean = true): void {
    this.process = true;
    this.deleteFilePhoto();

    const request = this.cobrand
      ? Api.cobrand.order.update(this.cobrand.slug, this.order.token, this.orderDataUpdate as IOrderB2c)
      : Api[this.apiMode].order.update(this.order.token, this.orderDataUpdate);

    request
      .then(({ data }) => {
        this.process = false;
        this.$store.commit('order', { ...this.order, ...data });
        this.$store.dispatch('getPublications');

        if (closeAfterRemove) {
          this.$store.commit('currentEditor', null);
        }
      })
      .catch(({ response: { data: errorData } }) => {
        this.process = false;
        this.$store.commit('currentEditor', null);
        showErrors(errorData);
      });
  }

  updateOrder(): void {
    const request = this.cobrand
      ? Api.cobrand.order.update(this.cobrand.slug, this.order.token, this.orderDataUpdate as IOrderB2c)
      : Api[this.apiMode].order.update(this.order.token, this.orderDataUpdate);

    request
      .then(({ data }) => {
        this.$store.commit('order', { ...this.order, ...data });
        this.$store.dispatch('getPublications');
        this.$store.commit('currentEditor', null);
      })
      .catch(({ response: { data: errorData } }) => {
        showErrors(errorData);
      })
      .finally(() => {
        this.process = false;
      });
  }

  close(): void {
    if (this.product && this.product.optionActive) {
      this.$store.commit('currentEditor', null);
    } else {
      this.$store.commit('photoPreview', null);
      this.$store.commit('currentEditor', null);
      this.uploadedImage = null;
    }
  }
}
</script>
