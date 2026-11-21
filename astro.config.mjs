// @ts-check
import { defineConfig } from 'astro/config';

// Saída 100% estática: publica em Vercel/Netlify/GitHub Pages sem servidor.
export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  // No Windows o watcher nativo às vezes trava (EBUSY) ao salvar e derruba o `astro dev`;
  // com polling ele só confere os arquivos de tempos em tempos e fica estável.
  vite: { server: { watch: { usePolling: true, interval: 300 } } },
});
