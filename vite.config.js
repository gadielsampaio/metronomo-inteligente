import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mude o valor de `base` para o nome EXATO do seu repositório no GitHub.
// Ex: se o repo se chama "meu-metronomo", coloque '/meu-metronomo/'
export default defineConfig({
  plugins: [react()],
  base: '/metronomo-inteligente/',
})
