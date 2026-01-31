import { message, Modal } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LiveBroadcastRecorder } from "./LiveBroadcastRecorder";
import { LiveBroadcastTargetSelector } from "./LiveBroadcastTargetSelector";

interface LiveBroadcastModalProps {
  open: boolean;
  onClose: () => void;
}

export const LiveBroadcastModal: React.FC<LiveBroadcastModalProps> = ({
  open,
  onClose,
}) => {
  const [status, setStatus] = useState<
    "idle" | "recording" | "paused" | "completed"
  >("idle");
  const [duration, setDuration] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [selectAllDevices, setSelectAllDevices] = useState(true);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  const checkBrowserSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Modal.warning({
        title: "Trình duyệt không hỗ trợ",
        content:
          "Trình duyệt của bạn không hỗ trợ ghi âm. Vui lòng sử dụng Chrome, Firefox, hoặc Edge phiên bản mới nhất.",
      });
      return false;
    }
    return true;
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        message.error(
          "Vui lòng cho phép truy cập microphone để sử dụng tính năng này"
        );
      } else if (error.name === "NotFoundError") {
        message.error("Không tìm thấy microphone. Vui lòng kiểm tra thiết bị.");
      } else {
        message.error("Không thể truy cập microphone: " + error.message);
      }
      return null;
    }
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Handle start recording
  const handleStart = useCallback(async () => {
    // Validate selection
    if (!selectedUnitId) {
      message.warning("Vui lòng chọn đơn vị trước khi bắt đầu");
      return;
    }

    if (selectedDeviceIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một thiết bị");
      return;
    }

    // Check browser support
    if (!checkBrowserSupport()) {
      return;
    }

    // Request microphone permission
    const stream = await requestMicrophonePermission();
    if (!stream) {
      return;
    }

    setAudioStream(stream);

    // Initialize MediaRecorder
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      setAudioChunks(chunks);
    };

    // Start recording
    mediaRecorder.start();
    setStatus("recording");
    setDuration(0);
    startTimer();

    message.success("Đã bắt đầu phát thanh!");
  }, [
    selectedUnitId,
    selectedDeviceIds,
    checkBrowserSupport,
    requestMicrophonePermission,
    startTimer,
  ]);

  // Handle pause
  const handlePause = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
      stopTimer();
      message.info("Đã tạm dừng phát thanh");
    }
  }, [status, stopTimer]);

  // Handle resume
  const handleResume = useCallback(() => {
    if (mediaRecorderRef.current && status === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
      startTimer();
      message.success("Đã tiếp tục phát thanh");
    }
  }, [status, startTimer]);

  // Handle stop
  const handleStop = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setStatus("completed");
      stopTimer();

      // Stop all audio tracks
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }

      message.success("Đã kết thúc phát thanh");
    }
  }, [audioStream, stopTimer]);

  // Handle save
  const handleSave = useCallback(() => {
    if (audioChunks.length === 0) {
      message.warning("Không có dữ liệu âm thanh để lưu");
      return;
    }

    // Create blob from chunks
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

    // Create download link
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `broadcast-${dayjs().format("YYYYMMDD-HHmmss")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success("Đã lưu bản ghi âm thành công!");

    // TODO: Upload to server
    // uploadAudio(audioBlob);
  }, [audioChunks]);

  // Handle close
  const handleClose = useCallback(() => {
    if (status === "recording" || status === "paused") {
      Modal.confirm({
        title: "Đang phát thanh",
        content: "Bạn có chắc chắn muốn đóng? Bản ghi âm sẽ không được lưu.",
        okText: "Đóng",
        okType: "danger",
        cancelText: "Hủy",
        onOk: () => {
          // Stop recording
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
          if (audioStream) {
            audioStream.getTracks().forEach((track) => track.stop());
          }
          stopTimer();

          // Reset state
          setStatus("idle");
          setDuration(0);
          setAudioStream(null);
          setAudioChunks([]);

          onClose();
        },
      });
    } else {
      // Reset state
      setStatus("idle");
      setDuration(0);
      setSelectedUnitId(null);
      setSelectedDeviceIds([]);
      setSelectAllDevices(true);
      setAudioStream(null);
      setAudioChunks([]);

      onClose();
    }
  }, [status, audioStream, stopTimer, onClose]);

  // Auto-manage timer based on status
  useEffect(() => {
    if (status === "recording") {
      // Ensure timer is running
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      }
    } else {
      // Stop timer if not recording
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStream]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-xl">
          <span className="text-2xl">🎙️</span>
          <span>Phát thanh trực tiếp</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Recorder UI */}
        <LiveBroadcastRecorder
          status={status}
          duration={duration}
          audioStream={audioStream}
          deviceCount={selectedDeviceIds.length}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onSave={handleSave}
        />

        {/* Target Selector */}
        {status === "idle" && (
          <LiveBroadcastTargetSelector
            selectedUnitId={selectedUnitId}
            onUnitChange={setSelectedUnitId}
            selectedDeviceIds={selectedDeviceIds}
            onDeviceIdsChange={setSelectedDeviceIds}
            selectAllDevices={selectAllDevices}
            onSelectAllChange={setSelectAllDevices}
          />
        )}

        {/* Info when recording */}
        {status !== "idle" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>📍 Đơn vị:</span>
                <span className="font-semibold text-gray-800">
                  {selectedUnitId || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>📡 Thiết bị:</span>
                <span className="font-semibold text-gray-800">
                  {selectedDeviceIds.length} thiết bị
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
