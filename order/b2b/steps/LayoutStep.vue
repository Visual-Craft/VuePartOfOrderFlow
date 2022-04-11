<template>
  <div class="row flex-nowrap">
    <div :class="{ 'w-100': editorMode, 'col-12': !editorMode }">
      <layout />
    </div>
    <div v-show="currentEditor" class="mr-3 editor-curtain b2b">
      <component :is="currentEditor" @selectEditor="setEditorMode" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Component, Watch } from 'vue-property-decorator';

@Component({
  components: {
    Layout: () => import('@/components/steps/layout/Layout.vue'),
    Symbols: () => import('@/components/steps/layout/Symbols.vue'),
    SeparationLine: () => import('@/components/steps/layout/SeparationLine.vue'),
    Logo: () => import('@/components/steps/layout/Logo.vue'),
    Photo: () => import('@/components/steps/layout/Photo.vue'),
    Cadres: () => import('@/components/steps/layout/Cadres.vue'),
    Fonds: () => import('@/components/steps/layout/Fonds.vue'),
  },

  computed: {
    ...mapState(['order', 'currentEditor', 'adType']),
  },
})
export default class LayoutStep extends Vue {
  editorMode: string | null = null;

  @Watch('currentEditor', { immediate: true })
  handler(value) {
    this.editorMode = value;
  }

  created() {
    if (!this.$route.query.token) {
      this.$store.dispatch('resetStoreState');
    }
  }

  mounted() {
    window.addEventListener('scroll', this.onScroll);
  }

  setEditorMode(value: string): void {
    this.editorMode = value;
  }

  onScroll(): void {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const sidebar = document.querySelector('.right-sidebar');

    if (currentScrollPosition <= 0 && sidebar) {
      sidebar.classList.remove('sticky');
    }

    if (currentScrollPosition > 180 && sidebar) {
      sidebar.classList.add('sticky');
    }
  }
}
</script>
