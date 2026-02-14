"use client";

import { useRef, useState, useCallback } from "react";

/**
 * Speech-to-text hook using the Azure Cognitive Services Speech SDK.
 * Uses continuous recognition for real-time streaming transcription.
 *
 * Requires:
 *   NEXT_PUBLIC_AZURE_SPEECH_KEY    — your Speech resource key
 *   NEXT_PUBLIC_AZURE_SPEECH_REGION — e.g. "eastus", "westus2", "centralindia"
 */
export function useSpeechToText(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState<string>("");

  const recognizerRef = useRef<any>(null);

  /* ═══════════════════════ START ════════════════════════════ */
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);
      setInterimText("");

      // 1. Validate env vars
      const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
      const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

      if (!speechKey || !speechRegion) {
        throw new Error(
          "Missing NEXT_PUBLIC_AZURE_SPEECH_KEY or NEXT_PUBLIC_AZURE_SPEECH_REGION. " +
            "Copy .env.local.example → .env.local and fill in your values."
        );
      }

      // 2. Dynamic import (keeps the SDK out of the server bundle)
      const sdk = await import("microsoft-cognitiveservices-speech-sdk");

      // 3. Configure
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        speechKey,
        speechRegion
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      // Use browser microphone
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

      // 4. Create recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      // ── "recognizing" — fires continuously with interim/partial results ──
      recognizer.recognizing = (_sender: any, event: any) => {
        const partial = event.result?.text ?? "";
        console.log("[STT] 📝 Recognizing:", partial);
        setInterimText(partial);
      };

      // ── "recognized" — fires when a phrase is finalized ──
      recognizer.recognized = (_sender: any, event: any) => {
        const sdk2 = sdk; // capture for ResultReason
        if (event.result.reason === sdk2.ResultReason.RecognizedSpeech) {
          const finalText = event.result.text?.trim();
          console.log("[STT] ✅ Recognized:", finalText);
          if (finalText) {
            onTranscript(finalText);
          }
        } else if (event.result.reason === sdk2.ResultReason.NoMatch) {
          console.log("[STT] No match — could not recognize speech");
        }
        setInterimText("");
      };

      // ── "canceled" — fires on errors or end of stream ──
      recognizer.canceled = (_sender: any, event: any) => {
        const sdk2 = sdk;
        console.error("[STT] ❌ Canceled:", event.errorDetails);
        if (event.reason === sdk2.CancellationReason.Error) {
          setError(event.errorDetails ?? "Speech recognition error");
        }
        setIsListening(false);
      };

      // ── session events ──
      recognizer.sessionStarted = () => {
        console.log("[STT] 🎤 Session started — listening");
        setIsListening(true);
        setIsConnecting(false);
      };

      recognizer.sessionStopped = () => {
        console.log("[STT] Session stopped");
        setIsListening(false);
      };

      // 5. Start continuous recognition
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log("[STT] ✅ Continuous recognition started");
        },
        (err: string) => {
          console.error("[STT] Failed to start:", err);
          setError(err);
          setIsConnecting(false);
        }
      );
    } catch (err: any) {
      console.error("[STT] startListening error:", err);
      setError(err?.message ?? "Failed to start listening.");
      setIsConnecting(false);
    }
  }, [onTranscript]);

  /* ═══════════════════════ STOP ═════════════════════════════ */
  const stopListening = useCallback(async () => {
    const recognizer = recognizerRef.current;
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log("[STT] Stopped ✅");
          recognizer.close();
          recognizerRef.current = null;
        },
        (err: string) => {
          console.error("[STT] Stop error:", err);
          recognizer.close();
          recognizerRef.current = null;
        }
      );
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  return {
    isListening,
    isConnecting,
    error,
    interimText,
    startListening,
    stopListening,
  };
}
