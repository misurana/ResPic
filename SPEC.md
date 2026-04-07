# Photo Enhance Pro - AI-Powered Image Enhancement

## Concept & Vision

Photo Enhance Pro is a sleek, professional-grade web application that transforms old, blurry, or damaged photos into crystal-clear masterpieces using AI. The app feels like a premium photo editing suite with the simplicity of a consumer tool - complex AI powered by FLUX Kontext runs behind the scenes, while users enjoy an intuitive drag-and-drop interface. The experience should feel magical: upload a faded photo, watch it come alive with clarity and color, then download results that exceed expectations.

## Design Language

### Aesthetic Direction
Dark, professional photo editing software aesthetic - similar to Adobe Lightroom or Capture One. Deep charcoal backgrounds with subtle gradients, crisp white typography, and vibrant accent colors that pop against the darkness. The UI should feel like a serious tool for serious results.

### Color Palette
- **Background Primary**: `#0f0f0f` (near-black)
- **Background Secondary**: `#1a1a1a` (dark charcoal)
- **Surface**: `#262626` (elevated surfaces)
- **Border**: `#333333` (subtle borders)
- **Text Primary**: `#ffffff` (pure white)
- **Text Secondary**: `#a0a0a0` (muted gray)
- **Accent Primary**: `#3b82f6` (electric blue)
- **Accent Hover**: `#2563eb` (deeper blue)
- **Success**: `#10b981` (emerald green)
- **Error**: `#ef4444` (red)
- **Warning**: `#f59e0b` (amber)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 600 weight, tight letter-spacing
- **Body**: 400 weight, relaxed line-height
- **Mono**: JetBrains Mono for stats/numbers

### Motion Philosophy
- Smooth, professional transitions (200-300ms ease-out)
- Progress animations convey serious processing
- Subtle hover states that feel responsive
- No playful bounces - everything is precise

## Layout & Structure

### Page Structure
1. **Header** - Minimal branding, clean navigation
2. **Hero Upload Zone** - Large, inviting drag-drop area
3. **Processing View** - Animated progress with stage indicators
4. **Results View** - Side-by-side comparison with controls
5. **Footer** - Subtle credits

### Responsive Strategy
- Mobile-first approach
- Upload zone scales proportionally
- Comparison slider works on touch
- Controls stack on mobile

## Features & Interactions

### Core Features

1. **Image Upload**
   - Drag-and-drop or click to browse
   - Supports JPG, PNG, WEBP (up to 10MB)
   - File validation with helpful error messages
   - Preview shows immediately upon selection

2. **AI Enhancement (FLUX Kontext)**
   - Backend sends image to Replicate API
   - Model: `flux-kontext-apps/restore-image`
   - Automatic restoration of old/damaged photos
   - Fixes scratches, damage, colorization

3. **Processing Animation**
   - Animated stage progression
   - Real-time status updates
   - Estimated time remaining

4. **Results Comparison**
   - Interactive before/after slider
   - Drag to reveal original vs enhanced
   - Zoom controls for detail inspection
   - Quality metrics display

5. **Download**
   - One-click download as PNG
   - Original quality preserved

### Interaction Details

- **Upload Zone Hover**: Border brightens, subtle pulse animation
- **Drag Active**: Zone highlight, "Release to upload" message
- **Processing**: Spinner with stage text, progress bar fills
- **Complete**: Success checkmark, smooth transition to results
- **Error**: Red border, error message, retry option

## Component Inventory

### Upload Zone
- Default: Dashed border, muted icon and text
- Hover: Brighter border, elevated feel
- Drag Active: Blue highlight, "Drop here" text
- Invalid File: Red border, error message
- Loading: Spinner replacing icon

### Progress Indicator
- Circular progress with percentage
- Stage label below
- Animated gradient fill

### Comparison Slider
- Vertical divider line with handle
- Draggable on desktop and touch
- Smooth movement, no jumping

### Action Buttons
- Primary: Blue background, white text
- Secondary: Transparent, border only
- Hover: Elevated shadow, brighter color
- Disabled: 50% opacity, no pointer events

### Toast Notifications
- Slide in from top-right
- Auto-dismiss after 5 seconds
- Color-coded by type (success/error/info)
- Click to dismiss

## Technical Approach

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Drag & Drop**: react-dropzone
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js + Express
- **AI Integration**: Replicate API (FLUX Kontext restore-image model)
- **Image Handling**: 
  - Accept multipart/form-data uploads
  - Convert to base64 for Replicate API
  - Return enhanced image to frontend

### API Design

#### POST /api/enhance
**Request:**
- Content-Type: multipart/form-data
- Body: `image` file

**Response:**
- Content-Type: image/png
- Body: Enhanced image binary

**Error Response:**
```json
{
  "error": "Description of error"
}
```

#### POST /api/enhance/batch
**Request:**
- Content-Type: multipart/form-data
- Body: `images[]` (up to 5 files)

**Response:**
```json
{
  "results": [
    { "original": "...", "enhanced": "..." }
  ]
}
```

### Replicate Integration
- **Model**: `flux-kontext-apps/restore-image`
- **Version**: 649f85101f2aa78111d7f873c3e38a2f8c844eecb6f6e9e39c1c6c7d6b8e4f8a
- **Input**: Image file stream (multipart upload)
- **Output**: Enhanced image URL from Replicate
- **Authentication**: Bearer token (configured in .env)
- **API Token**: r8_2kXAPjOHRryklmkMPSYOIsctyjfVZuS4JPHrz (configured)

### Environment Variables
```
REPLICATE_API_TOKEN=your_token_here
PORT=3001
```

## File Structure

```
/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── App.tsx
│   └── vite-env.d.ts
├── server/
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── public/
│   └── favicon.ico
├── SPEC.md
└── README.md
```