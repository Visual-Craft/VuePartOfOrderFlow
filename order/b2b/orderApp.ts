import Vue from 'vue';
import VueLocalStorage from 'vue-ls';
import createVueApplication from '../../common/createVueApplication';
import vuetify from '../../plugins/vuetify';
import App from './App';
import { storeB2b } from '../store';
import router from './router';

Vue.use(VueLocalStorage);

createVueApplication({
  el: '#order-process',
  components: { App },
  router,
  vuetify,
  store: storeB2b(),
  provide() {
    return {
      apiMode: 'b2b',
    };
  },
});
