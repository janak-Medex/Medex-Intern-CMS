import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@stripe/stripe-js', '@stripe/react-stripe-js']
  },
  resolve: {
    alias: {
      'prop-types': 'prop-types',
    },
  },

});
