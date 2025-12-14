// Demo data for audio samples and chat simulator

export interface AudioSample {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationMs: number;
  scenario: string;
  audioFile: string;
  transcript: TranscriptLine[];
}

export interface TranscriptLine {
  speaker: "ai" | "customer";
  text: string;
  timestamp: string;
  startMs: number;
  endMs: number;
  audioFile: string; // Individual segment audio file
}

// Each transcript line has its own audio segment file
export const audioSamples: AudioSample[] = [
  {
    id: "status-check",
    title: "Repair Status Check",
    description: "Customer calls to check on their Honda Civic repair",
    duration: "0:59",
    durationMs: 59160,
    scenario: "A customer calls to ask about their vehicle's repair status. The AI looks up their work order and provides a real-time update.",
    audioFile: "/audio/status-check/00.mp3", // First segment as default
    transcript: [
      { speaker: "ai", text: "Hi, thanks for calling Mike's Auto Shop! I'm the virtual assistant. How can I help you today?", timestamp: "0:00", startMs: 0, endMs: 7680, audioFile: "/audio/status-check/00.mp3" },
      { speaker: "customer", text: "Hi, I'm calling to check on my car. It's a Honda Civic.", timestamp: "0:08", startMs: 8180, endMs: 12660, audioFile: "/audio/status-check/01.mp3" },
      { speaker: "ai", text: "Of course! I can look that up for you. Can I get your last name or phone number?", timestamp: "0:13", startMs: 13160, endMs: 19640, audioFile: "/audio/status-check/02.mp3" },
      { speaker: "customer", text: "Johnson. Sarah Johnson.", timestamp: "0:20", startMs: 20140, endMs: 21980, audioFile: "/audio/status-check/03.mp3" },
      { speaker: "ai", text: "Thank you, Sarah. I found your Honda Civic. Let me check the status... Great news! Your car is ready for pickup. The brake pad replacement has been completed and the vehicle has been road tested.", timestamp: "0:22", startMs: 22480, endMs: 38720, audioFile: "/audio/status-check/04.mp3" },
      { speaker: "customer", text: "Oh wonderful! What time can I pick it up?", timestamp: "0:39", startMs: 39220, endMs: 42500, audioFile: "/audio/status-check/05.mp3" },
      { speaker: "ai", text: "We're open until 6 PM today. You can come by anytime before then. Is there anything else I can help you with?", timestamp: "0:43", startMs: 43000, endMs: 51880, audioFile: "/audio/status-check/06.mp3" },
      { speaker: "customer", text: "No, that's all. Thanks!", timestamp: "0:52", startMs: 52380, endMs: 54300, audioFile: "/audio/status-check/07.mp3" },
      { speaker: "ai", text: "You're welcome! We'll see you soon. Have a great day!", timestamp: "0:55", startMs: 54800, endMs: 59160, audioFile: "/audio/status-check/08.mp3" },
    ],
  },
  {
    id: "hours-location",
    title: "Hours & Location",
    description: "Customer asks about business hours and directions",
    duration: "0:41",
    durationMs: 40840,
    scenario: "A new customer calls after hours to ask when the shop is open and where it's located.",
    audioFile: "/audio/hours-location/00.mp3",
    transcript: [
      { speaker: "ai", text: "Hi, thanks for calling Mike's Auto Shop! I'm the virtual assistant. How can I help you today?", timestamp: "0:00", startMs: 0, endMs: 7680, audioFile: "/audio/hours-location/00.mp3" },
      { speaker: "customer", text: "What time do you guys open tomorrow?", timestamp: "0:08", startMs: 8180, endMs: 11060, audioFile: "/audio/hours-location/01.mp3" },
      { speaker: "ai", text: "We're open Monday through Friday from 8 AM to 6 PM, and Saturdays from 9 AM to 3 PM. We're closed on Sundays.", timestamp: "0:12", startMs: 11560, endMs: 20440, audioFile: "/audio/hours-location/02.mp3" },
      { speaker: "customer", text: "And where are you located?", timestamp: "0:21", startMs: 20940, endMs: 23020, audioFile: "/audio/hours-location/03.mp3" },
      { speaker: "ai", text: "We're at 1234 Main Street, right across from the Safeway grocery store. There's free parking in our lot behind the building.", timestamp: "0:24", startMs: 23520, endMs: 33480, audioFile: "/audio/hours-location/04.mp3" },
      { speaker: "customer", text: "Perfect, thanks!", timestamp: "0:34", startMs: 33980, endMs: 35260, audioFile: "/audio/hours-location/05.mp3" },
      { speaker: "ai", text: "You're welcome! We look forward to seeing you. Have a great day!", timestamp: "0:36", startMs: 35760, endMs: 40840, audioFile: "/audio/hours-location/06.mp3" },
    ],
  },
  {
    id: "transfer-request",
    title: "Transfer to Team",
    description: "Customer needs to speak with a mechanic about complex issue",
    duration: "0:50",
    durationMs: 49620,
    scenario: "A customer has a technical question about their repair. The AI recognizes it needs human expertise and transfers the call.",
    audioFile: "/audio/transfer-request/00.mp3",
    transcript: [
      { speaker: "ai", text: "Hi, thanks for calling Mike's Auto Shop! I'm the virtual assistant. How can I help you today?", timestamp: "0:00", startMs: 0, endMs: 7680, audioFile: "/audio/transfer-request/00.mp3" },
      { speaker: "customer", text: "Yeah, I have a question about the transmission work you quoted me. I want to understand what parts are being replaced.", timestamp: "0:08", startMs: 8180, endMs: 18020, audioFile: "/audio/transfer-request/01.mp3" },
      { speaker: "ai", text: "I'd be happy to help. That sounds like a detailed technical question that one of our mechanics would be best suited to answer. Would you like me to transfer you to our service team?", timestamp: "0:19", startMs: 18520, endMs: 33400, audioFile: "/audio/transfer-request/02.mp3" },
      { speaker: "customer", text: "Yes please.", timestamp: "0:34", startMs: 33900, endMs: 34860, audioFile: "/audio/transfer-request/03.mp3" },
      { speaker: "ai", text: "Of course. I'll transfer you now to Mike, our lead technician. He can walk you through the details of your transmission repair. One moment please.", timestamp: "0:35", startMs: 35360, endMs: 48160, audioFile: "/audio/transfer-request/04.mp3" },
      { speaker: "customer", text: "Thank you.", timestamp: "0:49", startMs: 48660, endMs: 49620, audioFile: "/audio/transfer-request/05.mp3" },
    ],
  },
];
