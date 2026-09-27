// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import { loadEnv } from 'vite';

const siteUrl = process.env.SITE_URL || loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'SITE_').SITE_URL;


// https://astro.build/config
export default defineConfig({
  site: siteUrl || undefined,
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-display',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
    },
    {
      provider: fontProviders.google(),
      name: 'Manrope',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
    },
  ],
});
