import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
  template: `
  <aside class="right-sidebar">
    <div class="editor-head">
      <p class="mdc-typography--body1 font--bold text-uppercase">{{ title }}</p>

      <a class="mdc-typography--subtitle1 no-wrap" @click.stop="$emit('closeEditor')">{{ $trans('editor_card.close') }}
        <v-icon class="pl-1">close</v-icon>
      </a>
    </div>
    <div class="editor-body">
      <slot name="body" />
    </div>
    <div class="editor-footer">
      <slot name="actions" />
    </div>
  </aside>
  `,
})
export default class EditorCard extends Vue {
  @Prop({ type: String, required: true })
  title!: string;
}
