# NVN Chatbot WordPress Plugin - Build Instructions

## 🏗️ Building the Embed Script

The chatbot widget needs to be built as a standalone JavaScript bundle that can be embedded in WordPress.

### Option 1: Build with Vite (Recommended)

1. Add a new build config to your project:

```bash
# Install build dependencies if not already present
npm install terser
```

2. Create a separate Vite config for the embed build:

```javascript
// vite.embed.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'public/wordpress-plugin/nvn-chatbot/assets',
    lib: {
      entry: 'src/embed/embed.tsx',
      name: 'NVNChat',
      fileName: () => 'nvn-chat.js',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    minify: 'terser',
  },
});
```

3. Add build script to package.json:

```json
{
  "scripts": {
    "build:embed": "vite build --config vite.embed.config.ts"
  }
}
```

4. Build the embed script:

```bash
npm run build:embed
```

### Option 2: Manual Bundle

If you can't modify the build config, you can manually create a bundle:

1. Copy the contents of `src/embed/EmbedChatWidget.tsx`
2. Use a bundler like esbuild, rollup, or webpack to create a standalone bundle
3. Place the output in `public/wordpress-plugin/nvn-chatbot/assets/nvn-chat.js`

## 📦 Plugin Installation

1. After building, zip the `nvn-chatbot` folder:

```bash
cd public/wordpress-plugin
zip -r nvn-chatbot.zip nvn-chatbot/
```

2. Upload to WordPress:
   - Go to Plugins -> Add New -> Upload Plugin
   - Select the `nvn-chatbot.zip` file
   - Click "Install Now"
   - Activate the plugin

3. Configure the plugin:
   - Go to Settings -> NVN Chatbot
   - Enter the API URL and API Key
   - Customize colors if needed
   - Save settings

## 🔑 API Credentials

Use these credentials in the WordPress plugin settings:

- **API URL:** `https://wxaqhgtoytwpvwzhfrqa.supabase.co/functions/v1/chat`
- **API Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4YXFoZ3RveXR3cHZ3emhmcnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTQyODEsImV4cCI6MjA4Mzk3MDI4MX0.ShgIrOdZR90nDtOfz7vHXr5i2T-gQwPiWdRV0QfJXc0`

## 🎨 Customization

The plugin supports these customization options:

| Option | Default | Description |
|--------|---------|-------------|
| Position | bottom-right | Widget position on screen |
| Primary Color | #7e57c2 | Header and bot message background |
| Accent Color | #c2185b | User message and button background |

## 🧪 Testing

To test the embed widget without WordPress:

```html
<!DOCTYPE html>
<html>
<head>
  <title>NVN Chatbot Test</title>
</head>
<body>
  <h1>Test Page</h1>
  <script src="path/to/nvn-chat.js"></script>
  <script>
    NVNChat.init({
      apiUrl: 'https://wxaqhgtoytwpvwzhfrqa.supabase.co/functions/v1/chat',
      apiKey: 'your-api-key',
      position: 'bottom-right',
      primaryColor: '#7e57c2',
      accentColor: '#c2185b'
    });
  </script>
</body>
</html>
```

## 📁 File Structure

```
nvn-chatbot/
├── nvn-chatbot.php      # Main plugin file
├── readme.txt           # WordPress plugin readme
└── assets/
    └── nvn-chat.js      # Compiled widget bundle (after build)
```
