"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Bot, User, Volume2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioSamples, type AudioSample } from "@/lib/demo-data";

// Format milliseconds to MM:SS
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Speaker Avatar Component
function SpeakerAvatar({
  type,
  isActive,
  label,
}: {
  type: "ai" | "customer";
  isActive: boolean;
  label: string;
}) {
  const isAI = type === "ai";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar with pulse animation */}
      <div className="relative">
        {/* Pulse ring animation when active */}
        {isActive && (
          <>
            <div
              className={`absolute inset-0 rounded-full ${
                isAI ? "bg-primary" : "bg-muted-foreground"
              } animate-ping opacity-20`}
            />
            <div
              className={`absolute -inset-2 rounded-full ${
                isAI ? "bg-primary/30" : "bg-muted-foreground/30"
              } animate-pulse`}
            />
          </>
        )}

        {/* Main avatar circle */}
        <div
          className={`relative flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full transition-all duration-300 ${
            isActive
              ? isAI
                ? "gradient-bg ring-4 ring-primary/40 scale-110"
                : "bg-muted ring-4 ring-muted-foreground/40 scale-110"
              : isAI
              ? "bg-primary/20"
              : "bg-muted/50"
          }`}
        >
          {isAI ? (
            <Bot
              className={`h-10 w-10 md:h-12 md:w-12 transition-colors ${
                isActive ? "text-white" : "text-primary"
              }`}
            />
          ) : (
            <User
              className={`h-10 w-10 md:h-12 md:w-12 transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            />
          )}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p
          className={`font-medium text-sm transition-colors ${
            isActive ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
        {isActive && (
          <div className="flex justify-center gap-1 mt-1">
            <div
              className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function AudioPlayer() {
  const [selectedSample, setSelectedSample] = useState<AudioSample>(
    audioSamples[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentTimeMs, setSegmentTimeMs] = useState(0);
  const [hasAudioFiles, setHasAudioFiles] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Get current speaker
  const currentSpeaker =
    selectedSample.transcript[currentSegmentIndex]?.speaker || "ai";

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
      const nextIndex = currentSegmentIndex + 1;
      if (nextIndex < selectedSample.transcript.length) {
        setCurrentSegmentIndex(nextIndex);
        setSegmentTimeMs(0);
        const nextSegment = selectedSample.transcript[nextIndex];
        audio.src = nextSegment.audioFile;
        audio.load();
        audio.play().catch(console.error);
      } else {
        setIsPlaying(false);
        setCurrentSegmentIndex(0);
        setSegmentTimeMs(0);
      }
    };

    const handleError = () => {
      setHasAudioFiles(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentSegmentIndex, selectedSample.transcript]);

  // Handle sample change
  const handleSampleChange = (sample: AudioSample) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedSample(sample);
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    setSegmentTimeMs(0);
  };

  // Play/Pause toggle
  const handlePlayPause = async () => {
    const audio = audioRef.current;

    if (!audio || !hasAudioFiles) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const currentSegment = selectedSample.transcript[currentSegmentIndex];
      if (audio.src !== window.location.origin + currentSegment.audioFile) {
        audio.src = currentSegment.audioFile;
        audio.load();
      }

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
      }
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

      {/* Call Recording Visualization Card */}
      <div className="rounded-2xl border bg-card p-6 md:p-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold">{selectedSample.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedSample.scenario}
          </p>
        </div>

        {/* Two Speaker Avatars */}
        <div className="flex justify-center items-start gap-12 md:gap-20 mb-8">
          <SpeakerAvatar
            type="customer"
            isActive={isPlaying && currentSpeaker === "customer"}
            label="Customer"
          />
          <SpeakerAvatar
            type="ai"
            isActive={isPlaying && currentSpeaker === "ai"}
            label="AI Assistant"
          />
        </div>

        {/* Current Dialog */}
        <div className="max-w-lg mx-auto mb-8 min-h-[5rem]">
          <div className="text-center">
            <span className="text-xs font-medium text-muted-foreground">
              {currentSpeaker === "ai" ? "AI Assistant" : "Customer"}
            </span>
            <p className="text-base mt-2">
              {selectedSample.transcript[currentSegmentIndex]?.text || ""}
            </p>
          </div>
        </div>

        {/* Progress Bar + Controls */}
        <div className="max-w-md mx-auto pt-6 border-t">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatTime(currentTimeMs)}</span>
            <span>{selectedSample.duration}</span>
          </div>

          {/* Play/Pause Button */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="Reset"
              className="h-10 w-10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              className={`h-12 px-6 rounded-full gap-2 ${isPlaying ? "" : "gradient-bg border-0"}`}
              variant={isPlaying ? "outline" : "default"}
              onClick={handlePlayPause}
              disabled={isLoading || !hasAudioFiles}
            >
              {currentSpeaker === "ai" ? (
                <Bot className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Loading/No Audio State */}
          {(isLoading || !hasAudioFiles) && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isLoading ? "Loading audio..." : "Audio files not available"}
            </p>
          )}
        </div>
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
