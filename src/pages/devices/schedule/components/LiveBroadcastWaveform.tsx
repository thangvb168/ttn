import React, { useEffect, useRef } from "react";

interface LiveBroadcastWaveformProps {
  isRecording: boolean;
  audioStream: MediaStream | null;
  status: "idle" | "recording" | "paused" | "completed";
}

export const LiveBroadcastWaveform: React.FC<LiveBroadcastWaveformProps> = ({
  isRecording,
  audioStream,
  status,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);

  useEffect(() => {
    if (!isRecording || !audioStream || status !== "recording") {
      // Stop animation if not recording
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Initialize Web Audio API
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);

    source.connect(analyser);
    analyser.fftSize = 2048;

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      analyserRef.current.getByteTimeDomainData(dataArray);

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#fef2f2");
      gradient.addColorStop(1, "#fee2e2");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ef4444"; // red-500
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Continue animation
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording, audioStream, status]);

  // Draw static waveform for paused/completed states
  useEffect(() => {
    if (status === "paused" || status === "completed") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw static waveform
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (status === "paused") {
        gradient.addColorStop(0, "#fffbeb");
        gradient.addColorStop(1, "#fef3c7");
        ctx.fillStyle = gradient;
      } else {
        gradient.addColorStop(0, "#ecfdf5");
        gradient.addColorStop(1, "#d1fae5");
        ctx.fillStyle = gradient;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.strokeStyle = status === "paused" ? "#f59e0b" : "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  }, [status]);

  return (
    <div className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={150}
        className="border-2 border-gray-200 rounded-lg shadow-sm"
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
};
