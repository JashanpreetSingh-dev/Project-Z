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
    duration: "0:45",
    durationMs: 45000,
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
    duration: "0:35",
    durationMs: 35000,
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
    duration: "0:40",
    durationMs: 40000,
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

// Chat simulator conversation data
export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  options?: ChatOption[];
  delay?: number; // ms before showing message
}

export interface ChatOption {
  id: string;
  text: string;
  nextMessageId: string;
}

export interface ChatScenario {
  id: string;
  title: string;
  description: string;
  startMessageId: string;
  messages: Record<string, ChatMessage>;
}

export const chatScenarios: ChatScenario[] = [
  {
    id: "status-demo",
    title: "Check Repair Status",
    description: "Experience how a customer checks on their vehicle repair",
    startMessageId: "greeting",
    messages: {
      greeting: {
        id: "greeting",
        role: "ai",
        text: "Hi, thanks for calling Mike's Auto Shop! I'm the virtual assistant. How can I help you today?",
        delay: 500,
        options: [
          { id: "opt1", text: "I want to check on my car repair", nextMessageId: "ask-name" },
          { id: "opt2", text: "What are your hours?", nextMessageId: "hours-response" },
          { id: "opt3", text: "I need to speak with someone", nextMessageId: "transfer-offer" },
        ],
      },
      "ask-name": {
        id: "ask-name",
        role: "ai",
        text: "Of course! I can look that up for you. Can I get your last name?",
        delay: 800,
        options: [
          { id: "opt1", text: "Johnson", nextMessageId: "found-order" },
          { id: "opt2", text: "Smith", nextMessageId: "found-order-2" },
        ],
      },
      "found-order": {
        id: "found-order",
        role: "ai",
        text: "Thank you! I found your 2019 Honda Civic in our system. Let me check the status... Great news! Your brake pad replacement is complete and your car is ready for pickup. The total is $287.50.",
        delay: 1200,
        options: [
          { id: "opt1", text: "What time can I pick it up?", nextMessageId: "pickup-time" },
          { id: "opt2", text: "That's all I needed, thanks!", nextMessageId: "goodbye" },
        ],
      },
      "found-order-2": {
        id: "found-order-2",
        role: "ai",
        text: "Thank you! I found your 2021 Toyota Camry in our system. Let me check... Your oil change and tire rotation are still in progress. We estimate it will be ready around 3 PM today.",
        delay: 1200,
        options: [
          { id: "opt1", text: "Can you call me when it's ready?", nextMessageId: "callback-confirm" },
          { id: "opt2", text: "Okay, thanks!", nextMessageId: "goodbye" },
        ],
      },
      "pickup-time": {
        id: "pickup-time",
        role: "ai",
        text: "We're open until 6 PM today, so you can come by anytime before then. Just head to the front desk and they'll have your keys ready.",
        delay: 800,
        options: [
          { id: "opt1", text: "Perfect, see you soon!", nextMessageId: "goodbye" },
          { id: "opt2", text: "What forms of payment do you accept?", nextMessageId: "payment-info" },
        ],
      },
      "payment-info": {
        id: "payment-info",
        role: "ai",
        text: "We accept all major credit cards, debit cards, cash, and checks. Is there anything else I can help with?",
        delay: 600,
        options: [
          { id: "opt1", text: "No, that's everything. Thanks!", nextMessageId: "goodbye" },
        ],
      },
      "callback-confirm": {
        id: "callback-confirm",
        role: "ai",
        text: "Absolutely! We have your phone number on file. We'll give you a call as soon as your Camry is ready. Is there anything else I can help with?",
        delay: 800,
        options: [
          { id: "opt1", text: "No, that's all. Thank you!", nextMessageId: "goodbye" },
        ],
      },
      "hours-response": {
        id: "hours-response",
        role: "ai",
        text: "We're open Monday through Friday from 8 AM to 6 PM, and Saturdays from 9 AM to 3 PM. We're closed on Sundays. Is there anything else I can help with?",
        delay: 800,
        options: [
          { id: "opt1", text: "Where are you located?", nextMessageId: "location-response" },
          { id: "opt2", text: "I'd like to check on a repair", nextMessageId: "ask-name" },
          { id: "opt3", text: "That's all, thanks!", nextMessageId: "goodbye" },
        ],
      },
      "location-response": {
        id: "location-response",
        role: "ai",
        text: "We're at 1234 Main Street, right across from Safeway. There's free parking behind the building. Anything else I can help with?",
        delay: 800,
        options: [
          { id: "opt1", text: "No, that's everything!", nextMessageId: "goodbye" },
        ],
      },
      "transfer-offer": {
        id: "transfer-offer",
        role: "ai",
        text: "Of course! I can transfer you to our service team right away. Before I do, can I ask what this is regarding so they're prepared to help you?",
        delay: 800,
        options: [
          { id: "opt1", text: "I have questions about a repair quote", nextMessageId: "transfer-confirm" },
          { id: "opt2", text: "Actually, can you just check my repair status?", nextMessageId: "ask-name" },
        ],
      },
      "transfer-confirm": {
        id: "transfer-confirm",
        role: "ai",
        text: "No problem! I'll transfer you to Mike, our lead technician. He can walk you through your quote in detail. One moment please... 📞",
        delay: 1000,
        options: [
          { id: "opt1", text: "[Start Over]", nextMessageId: "greeting" },
        ],
      },
      goodbye: {
        id: "goodbye",
        role: "ai",
        text: "You're welcome! Thanks for calling Mike's Auto Shop. Have a great day! 👋",
        delay: 600,
        options: [
          { id: "opt1", text: "[Start Over]", nextMessageId: "greeting" },
        ],
      },
    },
  },
];
