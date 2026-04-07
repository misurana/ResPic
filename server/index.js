const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Replicate = require('replicate');

const app = express();
const PORT = process.env.PORT || 3001;

// Load environment variables
require('dotenv').config();

// Initialize Replicate with API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'r8_2kXAPjOHRryklmkMPSYOIsctyjfVZuS4JPHrz',
});

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'));
    }
  },
});

// Enhancement presets with specific prompts
const ENHANCEMENT_PRESETS = {
  portrait: {
    prompt: "Enhance this portrait photo with better clarity, smooth skin texture, improved lighting on face, professional retouching while maintaining natural look. Fix any blurriness and enhance facial details.",
    description: "Best for portraits and selfies"
  },
  landscape: {
    prompt: "Enhance this landscape photo with sharper details, better contrast between sky and terrain, enriched colors for nature scenes, improved depth and clarity. Fix any motion blur or soft focus issues.",
    description: "Best for nature and scenery"
  },
  restore: {
    prompt: "Restore and enhance this old or damaged photo. Remove noise and grain, improve sharpness and clarity, correct colors, fix scratches or tears, enhance details while preserving the original character.",
    description: "Best for old/ damaged photos"
  },
  upscale: {
    prompt: "Upscale and enhance this image to higher resolution with sharp details, clear edges, smooth gradients, professional quality improvement. Maintain original composition while adding crispness.",
    description: "Best for low-res images"
  },
  general: {
    prompt: "Professional photo enhancement: improve overall clarity and sharpness, enhance colors and contrast, reduce noise and artifacts, optimize lighting and exposure, add depth and dimension. Make this photo look its best.",
    description: "General enhancement for any photo"
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasToken = !!process.env.REPLICATE_API_TOKEN;
  res.json({
    status: 'ok',
    replicateConfigured: hasToken,
    model: 'flux-kontext-apps/restore-image',
    presets: Object.keys(ENHANCEMENT_PRESETS)
  });
});

// Get available presets
app.get('/api/presets', (req, res) => {
  res.json({
    presets: ENHANCEMENT_PRESETS
  });
});

// Single image enhancement
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const preset = req.body.preset || 'general';
    const presetConfig = ENHANCEMENT_PRESETS[preset] || ENHANCEMENT_PRESETS.general;

    console.log(`🎨 Enhancing image with preset: ${preset}`);
    console.log(`📁 File: ${req.file.path}`);

    // Call Replicate API with FLUX Kontext model
    const modelVersion = '649f85101f2aa78111d7f873c3e38a2f8c844eecb6f6e9e39c1c6c7d6b8e4f8a';
    
    const input = {
      image: fs.createReadStream(req.file.path),
      prompt: presetConfig.prompt,
      sync_mode: true,
      auto_crop: true
    };

    console.log('🔄 Calling Replicate API...');
    
    let output = await replicate.run(
      `flux-kontext-apps/restore-image:${modelVersion}`,
      { input }
    );

    // Handle different output formats
    let imageUrl = output;
    
    if (typeof output === 'object') {
      if (output.url) {
        imageUrl = output.url;
      } else if (output.output) {
        imageUrl = output.output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      }
    }

    console.log('✅ Enhancement complete!');
    console.log('📤 Output:', imageUrl);

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    res.json({
      success: true,
      original: `/uploads/${req.file.filename}`,
      enhanced: imageUrl,
      preset: preset,
      prompt: presetConfig.prompt,
      message: 'Image enhanced successfully!'
    });

  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    
    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enhance image',
      details: error.stack
    });
  }
});

// Batch enhancement
app.post('/api/enhance/batch', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 images allowed per batch' });
    }

    const preset = req.body.preset || 'general';
    const presetConfig = ENHANCEMENT_PRESETS[preset] || ENHANCEMENT_PRESETS.general;

    console.log(`🎨 Batch enhancing ${req.files.length} images with preset: ${preset}`);

    const results = await Promise.all(
      req.files.map(async (file) => {
        try {
          const modelVersion = '649f85101f2aa78111d7f873c3e38a2f8c844eecb6f6e9e39c1c6c7d6b8e4f8a';
          
          const input = {
            image: fs.createReadStream(file.path),
            prompt: presetConfig.prompt,
            sync_mode: true,
            auto_crop: true
          };

          const output = await replicate.run(
            `flux-kontext-apps/restore-image:${modelVersion}`,
            { input }
          );

          let imageUrl = output;
          if (typeof output === 'object' && output.url) imageUrl = output.url;
          else if (typeof output === 'object' && output.output) imageUrl = output.output;
          else if (Array.isArray(output) && output.length > 0) imageUrl = output[0];

          // Clean up
          fs.unlink(file.path, () => {});

          return {
            success: true,
            original: file.originalname,
            enhanced: imageUrl
          };
        } catch (err) {
          fs.unlink(file.path, () => {});
          return {
            success: false,
            original: file.originalname,
            error: err.message
          };
        }
      })
    );

    res.json({
      success: true,
      preset: preset,
      results: results,
      message: `Processed ${results.length} images`
    });

  } catch (error) {
    console.error('❌ Batch enhancement failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve static files from uploads
app.use('/uploads', express.static(uploadsDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Photo Enhance Pro Backend Server                      ║
║                                                            ║
║   Server running on: http://localhost:${PORT}                 ║
║   Replicate API: ✅ Configured                             ║
║   Model: FLUX Kontext restore-image                        ║
║                                                            ║
║   Endpoints:                                               ║
║   • GET  /api/health     - Health check                    ║
║   • GET  /api/presets    - Available presets               ║
║   • POST /api/enhance    - Single image enhancement        ║
║   • POST /api/enhance/batch - Batch enhancement (max 5)   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;