"use client";

import { useState, useCallback } from "react";
import { Mic, MicOff, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechToText } from "@/lib/use-speech-stt";

export default function Home() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTranscript = useCallback((transcript: string) => {
    setText((prev) => {
      const separator = prev.length > 0 ? " " : "";
      return prev + separator + transcript;
    });
  }, []);

  const { isListening, isConnecting, error, interimText, startListening, stopListening } =
    useSpeechToText(handleTranscript);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    setText("");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* ── Scanline overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,102,255,0.015) 2px, rgba(0,102,255,0.015) 4px)",
        }}
      />

      {/* ── Header ── */}
      <header className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
            <h1 className="text-lg font-semibold tracking-tight font-sans text-foreground">
              Azure Voice<span className="text-muted-foreground/60">STT</span>
            </h1>
          </div>
          <span className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
            Speech → Text
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          {/* Status bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isListening && (
                <>
                  <div className="flex items-end gap-[3px] h-5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-primary rounded-full animate-wave-bar"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          height: "4px",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-primary font-mono">
                    LISTENING
                  </span>
                </>
              )}
              {isConnecting && (
                <span className="text-xs text-muted-foreground font-mono animate-pulse">
                  CONNECTING…
                </span>
              )}
              {!isListening && !isConnecting && (
                <span className="text-xs text-muted-foreground font-mono">
                  READY
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              {text.length > 0 && <span>{text.split(/\s+/).filter(Boolean).length} words</span>}
            </div>
          </div>

          {/* Editor area */}
          <div className="relative group">
            <div
              className={`absolute -inset-[1px] rounded-lg transition-all duration-500 ${
                isListening
                  ? "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse-glow"
                  : "bg-transparent"
              }`}
            />
            <Textarea
              value={text + (interimText ? (text ? " " : "") + interimText : "")}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or click the microphone to speak…"
              className="relative min-h-[320px] resize-y bg-card/50 border-border/50 text-foreground placeholder:text-muted-foreground/40 font-mono text-sm leading-relaxed focus:border-primary/50 transition-all duration-300"
              style={{
                caretColor: "#0066FF",
              }}
            />
          </div>

          {/* Interim text indicator */}
          {interimText && (
            <p className="text-xs text-primary/50 font-mono truncate">
              ▸ {interimText}
            </p>
          )}

          {/* Error display */}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-xs text-destructive font-mono">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleToggleMic}
                disabled={isConnecting}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="gap-2 font-mono text-sm tracking-wide"
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    {isConnecting ? "Connecting…" : "Speak"}
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                disabled={!text}
                className="gap-1.5 font-mono text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                onClick={handleClear}
                variant="ghost"
                size="sm"
                disabled={!text}
                className="gap-1.5 font-mono text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border/20 px-6 py-3">
        <p className="text-center text-[10px] text-muted-foreground/40 font-mono tracking-wider">
          POWERED BY AZURE COGNITIVE SERVICES SPEECH SDK
        </p>
      </footer>
    </main>
  );
}
