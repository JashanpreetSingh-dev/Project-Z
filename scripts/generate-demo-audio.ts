/**
 * Audio Generation Script for Demo Page
 *
 * This script generates MP3 audio files from the demo transcripts using OpenAI TTS.
 * It creates individual segment files for each transcript line.
 *
 * Usage:
 *   npx ts-node scripts/generate-demo-audio.ts
 *
 * Prerequisites:
 *   - OPENAI_API_KEY in .env file or environment variable
 *   - npm install in the scripts folder
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env files (check scripts/.env, then backend/.env as fallback)
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", "backend", ".env") });

import OpenAI from "openai";

// Voice configuration
const VOICES = {
  ai: "nova" as const, // Warm, professional AI voice
  customer: "onyx" as const, // Distinct customer voice
};

// Audio sample data (mirrored from frontend/lib/demo-data.ts)
interface TranscriptLine {
  speaker: "ai" | "customer";
  text: string;
  timestamp: string;
}

interface AudioSample {
  id: string;
  title: string;
  transcript: TranscriptLine[];
}

const audioSamples: AudioSample[] = [
  {
    id: "status-check",
    title: "Repair Status Check",
    transcript: [
      {
        speaker: "ai",
        text: "Hi, thanks for calling Mike's Auto Shop! I'm the virtual assistant. How can I help you today?",
        timestamp: "0:00",
      },
      {
        speaker: "customer",
        text: "Hi, I'm calling to check on my car. It's a Honda Civic.",
        timestamp: "0:05",
      },
      {
        speaker: "ai",
        text: "Of course! I can look that up for you. Can I get your last name or phone number?",
        timestamp: "0:10",
      },
      {
        speaker: "customer",
        text: "Johnson. Sarah Johnson.",
        timestamp: "0:15",
      },
      {
        speaker: "ai",
        text: "Thank you, Sarah. I found your Honda Civic. Let me check the status... Great news! Your car is ready for pickup. The brake pad replacement has been completed and the vehicle has been road tested.",
        timestamp: "0:18",
      },
      {
        speaker: "customer",
        text: "Oh wonderful! What time can I pick it up?",
        timestamp: "0:32",
      },
      {
        speaker: "ai",
        text: "We're open until 6 PM today. You can come by anytime before then. Is there anything else I can help you with?",
        timestamp: "0:36",
      },
      { speaker: "customer", text: "No, that's all. Thanks!", timestamp: "0:42" },
      {
        speaker: "ai",
        text: "You're welcome! We'll see you soon. Have a great day!",
        timestamp: "0:44",
      },
    ],
  },
  {
    id: "hours-location",
    title: "Hours & Location",
    transcript: [
      {
        speaker: "ai",
        text: "Hi, thanks for calling Mike's Auto Shop! I'm the virtual assistant. How can I help you today?",
        timestamp: "0:00",
      },
      {
        speaker: "customer",
        text: "What time do you guys open tomorrow?",
        timestamp: "0:05",
      },
      {
        speaker: "ai",
        text: "We're open Monday through Friday from 8 AM to 6 PM, and Saturdays from 9 AM to 3 PM. We're closed on Sundays.",
        timestamp: "0:09",
      },
      {
        speaker: "customer",
        text: "And where are you located?",
        timestamp: "0:18",
      },
      {
        speaker: "ai",
        text: "We're at 1234 Main Street, right across from the Safeway grocery store. There's free parking in our lot behind the building.",
        timestamp: "0:22",
      },
      { speaker: "customer", text: "Perfect, thanks!", timestamp: "0:32" },
      {
        speaker: "ai",
        text: "You're welcome! We look forward to seeing you. Have a great day!",
        timestamp: "0:34",
      },
    ],
  },
  {
    id: "transfer-request",
    title: "Transfer to Team",
    transcript: [
      {
        speaker: "ai",
        text: "Hi, thanks for calling Mike's Auto Shop! I'm the virtual assistant. How can I help you today?",
        timestamp: "0:00",
      },
      {
        speaker: "customer",
        text: "Yeah, I have a question about the transmission work you quoted me. I want to understand what parts are being replaced.",
        timestamp: "0:05",
      },
      {
        speaker: "ai",
        text: "I'd be happy to help. That sounds like a detailed technical question that one of our mechanics would be best suited to answer. Would you like me to transfer you to our service team?",
        timestamp: "0:14",
      },
      { speaker: "customer", text: "Yes please.", timestamp: "0:25" },
      {
        speaker: "ai",
        text: "Of course. I'll transfer you now to Mike, our lead technician. He can walk you through the details of your transmission repair. One moment please.",
        timestamp: "0:27",
      },
      { speaker: "customer", text: "Thank you.", timestamp: "0:38" },
    ],
  },
];

interface SegmentInfo {
  index: number;
  speaker: "ai" | "customer";
  text: string;
  audioFile: string;
}

async function generateSegmentAudio(
  openai: OpenAI,
  text: string,
  speaker: "ai" | "customer",
  outputPath: string
): Promise<void> {
  const voice = VOICES[speaker];

  console.log(`  Generating: ${speaker} - "${text.substring(0, 40)}..."`);

  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: text,
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
}

async function generateSampleSegments(
  openai: OpenAI,
  sample: AudioSample,
  outputDir: string
): Promise<SegmentInfo[]> {
  console.log(`\nGenerating segments for: ${sample.title}`);

  // Create sample-specific directory
  const sampleDir = path.join(outputDir, sample.id);
  if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true });
  }

  const segments: SegmentInfo[] = [];

  for (let i = 0; i < sample.transcript.length; i++) {
    const line = sample.transcript[i];
    const fileName = `${i.toString().padStart(2, "0")}.mp3`;
    const filePath = path.join(sampleDir, fileName);

    await generateSegmentAudio(openai, line.text, line.speaker, filePath);

    segments.push({
      index: i,
      speaker: line.speaker,
      text: line.text,
      audioFile: `/audio/${sample.id}/${fileName}`,
    });
  }

  console.log(`  Saved ${segments.length} segments to ${sampleDir}`);
  return segments;
}

async function main() {
  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY environment variable is not set");
    console.error("Set it with: set OPENAI_API_KEY=your-key-here (Windows)");
    console.error("         or: export OPENAI_API_KEY=your-key-here (Unix)");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  // Create output directory
  const outputDir = path.join(__dirname, "..", "frontend", "public", "audio");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("=== Demo Audio Generator ===");
  console.log(`Output directory: ${outputDir}`);
  console.log(`AI Voice: ${VOICES.ai}`);
  console.log(`Customer Voice: ${VOICES.customer}`);

  const allSegments: Record<string, SegmentInfo[]> = {};

  // Generate audio segments for each sample
  for (const sample of audioSamples) {
    const segments = await generateSampleSegments(openai, sample, outputDir);
    allSegments[sample.id] = segments;
  }

  // Save segment metadata for use in the frontend
  const metadataPath = path.join(outputDir, "segments.json");
  fs.writeFileSync(metadataPath, JSON.stringify(allSegments, null, 2));
  console.log(`\nSaved segment metadata: ${metadataPath}`);

  console.log("\n=== Generation Complete ===");
  console.log("Generated directories:");
  audioSamples.forEach((sample) => {
    console.log(`  - ${sample.id}/`);
  });
  console.log("  - segments.json");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
