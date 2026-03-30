import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import authConfig from './config/auth_config.json'
import { installAuthLock } from './services/auth-lock'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)
installAuthLock(app, { router, pinia, config: authConfig })

app.mount('#app')
