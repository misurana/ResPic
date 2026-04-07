# Photo Enhance Pro

AI-powered image enhancement application using FLUX Kontext for restoring old, blurry, and damaged photographs.

![Photo Enhance Pro](https://via.placeholder.com/800x400/0f0f0f/3b82f6?text=Photo+Enhance+Pro)

## ✨ Features

- **🖼️ Drag & Drop Upload** - Easy image upload with support for JPG, PNG, WEBP
- **🤖 AI-Powered Enhancement** - Uses FLUX Kontext restore-image model
- **⚡ Real-Time Processing** - Animated progress with stage indicators
- **🔍 Before/After Comparison** - Interactive slider to compare original and enhanced
- **📥 One-Click Download** - Save enhanced images in high quality PNG format
- **📦 Batch Processing** - Enhance multiple images at once (up to 5)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Replicate API token ([Get one here](https://replicate.com/account/api-tokens))

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with your API token
cp .env.example .env
# Edit .env and add your REPLICATE_API_TOKEN

# Start server
npm start
```

The backend runs on `http://localhost:3001` and the frontend connects to it automatically.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Required - Your Replicate API token
REPLICATE_API_TOKEN=r8_YourTokenHere

# Optional - Server port (default: 3001)
PORT=3001

# Optional - Node environment
NODE_ENV=development
```

### Getting Your API Token

1. Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Copy your API token
3. Paste it into your `.env` file

## 📡 API Endpoints

### POST /api/enhance

Enhance a single image using FLUX Kontext.

**Request:**
```bash
curl -X POST http://localhost:3001/api/enhance \
  -H "Content-Type: multipart/form-data" \
  -F "image=@photo.jpg"
```

**Response:** Enhanced image binary (PNG)

### POST /api/enhance/preset

Enhance with specific preset.

**Request:**
```bash
curl -X POST http://localhost:3001/api/enhance/preset \
  -H "Content-Type: multipart/form-data" \
  -F "image=@photo.jpg" \
  -F "preset=general"
```

**Presets:** `general`, `deblur`, `colorize`, `denoise`, `faces`

### POST /api/enhance/batch

Enhance multiple images (up to 5).

**Request:**
```bash
curl -X POST http://localhost:3001/api/enhance/batch \
  -H "Content-Type: multipart/form-data" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg"
```

### GET /api/health

Check server health and configuration.

```bash
curl http://localhost:3001/api/health
```

## 🎨 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- react-dropzone
- Axios
- Lucide Icons

### Backend
- Node.js + Express
- Replicate SDK
- Multer (file uploads)
- CORS

### AI Model
- [FLUX Kontext restore-image](https://replicate.com/flux-kontext-apps/restore-image)
- Powered by Black Forest Labs

## 📁 Project Structure

```
photo-enhance-pro/
├── src/
│   ├── App.tsx          # Main React component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── server/
│   ├── index.js         # Express server
│   ├── package.json     # Server dependencies
│   └── .env.example     # Environment template
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── SPEC.md              # Design specification
└── README.md
```

## ⚠️ Important Notes

- **API Token Required**: You must have a Replicate API token to use this application
- **Image Size**: Maximum upload size is 10MB
- **Supported Formats**: JPG, PNG, WEBP
- **Processing Time**: Varies based on image size and server load (typically 10-30 seconds)

## 🔒 API Cost

Using the FLUX Kontext model through Replicate will consume API credits. Check [Replicate's pricing](https://replicate.com/pricing) for details.

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ using FLUX Kontext and React**