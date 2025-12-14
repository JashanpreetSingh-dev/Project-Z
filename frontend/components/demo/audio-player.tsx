"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioSamples, type AudioSample, type TranscriptLine } from "@/lib/demo-data";

// Format milliseconds to MM:SS
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Generate static waveform bars (seeded by sample id for consistency)
function generateWaveformBars(sampleId: string, count: number): number[] {
  const bars: number[] = [];
  let seed = sampleId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const random = seed / 233280;
    bars.push(25 + Math.sin(i * 0.3) * 15 + random * 30);
  }
  return bars;
}

export function AudioPlayer() {
  const [selectedSample, setSelectedSample] = useState<AudioSample>(audioSamples[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentTimeMs, setSegmentTimeMs] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasAudioFiles, setHasAudioFiles] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const waveformBars = useRef<number[]>(generateWaveformBars(selectedSample.id, 60));

  // Calculate total elapsed time based on completed segments + current segment time
  const calculateTotalTimeMs = useCallback(() => {
    let total = 0;
    for (let i = 0; i < currentSegmentIndex; i++) {
      const line = selectedSample.transcript[i];
      total += line.endMs - line.startMs;
    }
    return total + segmentTimeMs;
  }, [currentSegmentIndex, segmentTimeMs, selectedSample.transcript]);

  const currentTimeMs = calculateTotalTimeMs();

  // Check if audio files exist by attempting to load the first segment
  useEffect(() => {
    const checkFirstSegment = async () => {
      setIsLoading(true);
      const firstSegment = selectedSample.transcript[0]?.audioFile;
      if (!firstSegment) {
        setHasAudioFiles(false);
        setIsLoading(false);
        return;
      }
      
      // Use a test audio element to check if file can be loaded
      const testAudio = new Audio();
      testAudio.preload = "metadata";
      
      const onCanPlay = () => {
        setHasAudioFiles(true);
        setIsLoading(false);
        cleanup();
      };
      
      const onError = () => {
        setHasAudioFiles(false);
        setIsLoading(false);
        cleanup();
      };
      
      const cleanup = () => {
        testAudio.removeEventListener("canplaythrough", onCanPlay);
        testAudio.removeEventListener("error", onError);
        testAudio.src = "";
      };
      
      testAudio.addEventListener("canplaythrough", onCanPlay);
      testAudio.addEventListener("error", onError);
      testAudio.src = firstSegment;
      testAudio.load();
    };
    
    checkFirstSegment();
  }, [selectedSample]);

  // Set up audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setSegmentTimeMs(audio.currentTime * 1000);
    };

    const handleEnded = () => {
      // Move to next segment
      const nextIndex = currentSegmentIndex + 1;
      if (nextIndex < selectedSample.transcript.length) {
        setCurrentSegmentIndex(nextIndex);
        setSegmentTimeMs(0);
        // Load and play next segment
        const nextSegment = selectedSample.transcript[nextIndex];
        audio.src = nextSegment.audioFile;
        audio.load();
        audio.play().catch(console.error);
      } else {
        // Conversation finished
        setIsPlaying(false);
        setCurrentSegmentIndex(0);
        setSegmentTimeMs(0);
      }
    };

    const handleCanPlay = () => {
      // Audio segment is ready to play
    };

    const handleError = () => {
      setHasAudioFiles(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [currentSegmentIndex, selectedSample.transcript]);

  // Auto-scroll transcript to current line
  useEffect(() => {
    if (showTranscript && currentSegmentIndex >= 0 && transcriptRef.current) {
      const lineElement = transcriptRef.current.children[currentSegmentIndex] as HTMLElement;
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSegmentIndex, showTranscript]);

  // Handle sample change
  const handleSampleChange = (sample: AudioSample) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedSample(sample);
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    setSegmentTimeMs(0);
    waveformBars.current = generateWaveformBars(sample.id, 60);
  };

  // Play/Pause toggle
  const handlePlayPause = async () => {
    const audio = audioRef.current;

    if (!audio || !hasAudioFiles) {
      return; // No audio available
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Load current segment if not loaded
      const currentSegment = selectedSample.transcript[currentSegmentIndex];
      if (audio.src !== window.location.origin + currentSegment.audioFile) {
        audio.src = currentSegment.audioFile;
        audio.load();
      }
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
      }
    }
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Playback rate control
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Reset playback
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSegmentIndex(0);
    setSegmentTimeMs(0);
    setIsPlaying(false);
  };

  // Calculate progress percentage
  const progress = (currentTimeMs / selectedSample.durationMs) * 100;

  // Check if a transcript line is currently active
  const isLineActive = (index: number): boolean => {
    return index === currentSegmentIndex && isPlaying;
  };

  const isLinePast = (index: number): boolean => {
    return index < currentSegmentIndex;
  };

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" className="hidden" />

      {/* Sample Selection */}
      <div className="grid gap-4 md:grid-cols-3">
        {audioSamples.map((sample) => (
          <button
            key={sample.id}
            onClick={() => handleSampleChange(sample)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selectedSample.id === sample.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selectedSample.id === sample.id ? "gradient-bg" : "bg-primary/10"
                }`}
              >
                <Volume2
                  className={`h-5 w-5 ${
                    selectedSample.id === sample.id ? "text-white" : "text-primary"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-medium text-sm">{sample.title}</h3>
                <p className="text-xs text-muted-foreground">{sample.duration}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Player Card */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{selectedSample.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{selectedSample.scenario}</p>
        </div>

        {/* Waveform Visualization */}
        <div className="relative h-16 bg-muted/50 rounded-lg overflow-hidden mb-4 cursor-pointer group">
          {/* Progress overlay */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />

          {/* Waveform bars */}
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {waveformBars.current.map((height, i) => {
              const barProgress = (i / waveformBars.current.length) * 100;
              const isActive = barProgress < progress;
              const isCurrent =
                Math.abs(barProgress - progress) < 100 / waveformBars.current.length;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isActive
                      ? "bg-primary"
                      : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                  } ${isCurrent && isPlaying ? "scale-y-110" : ""}`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>

          {/* Hover indicator */}
          <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>{formatTime(currentTimeMs)}</span>
          <span>{selectedSample.duration}</span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Play/Pause */}
          <Button
            size="lg"
            className={isPlaying ? "" : "gradient-bg border-0"}
            variant={isPlaying ? "outline" : "default"}
            onClick={handlePlayPause}
            disabled={isLoading || !hasAudioFiles}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                {isLoading ? "Loading..." : hasAudioFiles ? "Play" : "No Audio"}
              </>
            )}
          </Button>

          {/* Reset */}
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset">
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-primary cursor-pointer"
              title="Volume"
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-1 ml-auto">
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => handlePlaybackRateChange(rate)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  playbackRate === rate
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Transcript Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowTranscript(!showTranscript)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {showTranscript ? "Hide" : "Show"} Transcript
            {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Current Speaker Indicator */}
        {isPlaying && currentSegmentIndex >= 0 && (
          <div className="mt-4 flex items-center gap-2 animate-fade-in">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                selectedSample.transcript[currentSegmentIndex].speaker === "ai"
                  ? "gradient-bg"
                  : "bg-muted"
              }`}
            >
              {selectedSample.transcript[currentSegmentIndex].speaker === "ai" ? (
                <Bot className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="text-sm font-medium">
              {selectedSample.transcript[currentSegmentIndex].speaker === "ai"
                ? "AI Speaking"
                : "Customer Speaking"}
            </span>
            <div className="flex gap-1 ml-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Transcript */}
        {showTranscript && (
          <div className="mt-6 pt-6 border-t space-y-4 animate-fade-in">
            <h4 className="font-medium text-sm text-muted-foreground">Transcript</h4>
            <div ref={transcriptRef} className="space-y-3 max-h-80 overflow-y-auto scroll-smooth">
              {selectedSample.transcript.map((line, i) => {
                const active = isLineActive(i);
                const past = isLinePast(i);
                return (
                  <div
                    key={i}
                    className={`flex gap-3 transition-all duration-300 ${
                      line.speaker === "ai" ? "" : "flex-row-reverse"
                    } ${active ? "scale-[1.02]" : ""} ${past ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                        line.speaker === "ai"
                          ? active
                            ? "gradient-bg ring-2 ring-primary/30"
                            : "bg-primary/10"
                          : active
                          ? "bg-muted ring-2 ring-muted-foreground/30"
                          : "bg-muted/50"
                      }`}
                    >
                      {line.speaker === "ai" ? (
                        <Bot className={`h-4 w-4 ${active ? "text-white" : "text-primary"}`} />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div
                      className={`flex-1 text-sm p-3 rounded-lg transition-all ${
                        line.speaker === "ai"
                          ? active
                            ? "bg-primary/10 ring-1 ring-primary/20"
                            : "bg-muted/50"
                          : active
                          ? "bg-primary/15 ring-1 ring-primary/20 text-right"
                          : "bg-primary/5 text-right"
                      }`}
                    >
                      {line.text}
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground self-center w-10">
                      {line.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-sm text-muted-foreground text-center">
        {hasAudioFiles
          ? "Listen to real AI voice samples demonstrating typical conversations."
          : "Audio files are being generated. Please run the generation script."}
      </p>
    </div>
  );
}
