# Scripts

Utility scripts for the Voice Receptionist project.

## Generate Demo Audio

This script generates MP3 audio files for the demo page using OpenAI TTS.

### Prerequisites

1. Set your OpenAI API key:
   ```powershell
   # Windows PowerShell
   $env:OPENAI_API_KEY = "your-api-key-here"
   ```

   ```bash
   # Unix/Mac
   export OPENAI_API_KEY="your-api-key-here"
   ```

2. Install dependencies:
   ```bash
   cd scripts
   npm install
   ```

### Usage

Run the script to generate audio files:

```bash
npm run generate-audio
```

This will:
1. Generate MP3 files for each demo conversation
2. Save them to `frontend/public/audio/`
3. Create a `timings.json` file with timing metadata

### Voice Configuration

The script uses OpenAI TTS voices:
- **AI Voice**: `nova` (warm, professional)
- **Customer Voice**: `onyx` (distinct, casual)

You can modify the voices in `generate-demo-audio.ts`.

### Cost

OpenAI TTS pricing is ~$15 per 1M characters. The demo audio generation costs approximately $0.03 total (one-time cost).

### Output

After running, you'll have:
```
frontend/public/audio/
├── status-check.mp3
├── hours-location.mp3
├── transfer-request.mp3
└── timings.json
```
