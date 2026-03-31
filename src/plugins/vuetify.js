import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0a7cb9',
          secondary: '#1b5a7d',
          accent: '#f26897',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#ffc107',
          surface: '#ffffff',
          background: '#f4f9fc',
        },
      },
    },
  },
})
