import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
<<<<<<< HEAD
      '/api': 'http://localhost:5000',
    },
  },
});
=======
      '/api': 'https://url-shortener-with-analytics-fsre.onrender.com',
    },
  },
});
>>>>>>> 92e08375ea182bcbf032925eb2ff7e1840518d4f
