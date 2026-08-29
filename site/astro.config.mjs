// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { fileURLToPath } from 'node:url'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'

import slugtree from 'slugtree/astro'

export default defineConfig({
  site: 'https://react-callback-hooks.daustinn.com',
  srcDir: '.',
  output: 'static',
  integrations: [
    react(),
    sitemap(),
    slugtree({
      contentDir: './content'
    })
  ],
  adapter: cloudflare({
    prerenderEnvironment: 'node'
  }),
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        'react-callback-hooks': fileURLToPath(
          // eslint-disable-next-line no-undef
          new URL('../src/index.ts', import.meta.url)
        )
      }
    },
    plugins: [tailwindcss()]
  }
})
