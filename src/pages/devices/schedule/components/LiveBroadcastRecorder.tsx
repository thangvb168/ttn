import {
  AudioOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Badge, Button, Space } from "antd";
import React from "react";
import { LiveBroadcastWaveform } from "./LiveBroadcastWaveform";

interface LiveBroadcastRecorderProps {
  status: "idle" | "recording" | "paused" | "completed";
  duration: number;
  audioStream: MediaStream | null;
  deviceCount: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSave: () => void;
}

export const LiveBroadcastRecorder: React.FC<LiveBroadcastRecorderProps> = ({
  status,
  duration,
  audioStream,
  deviceCount,
  onStart,
  onPause,
  onResume,
  onStop,
  onSave,
}) => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case "idle":
        return {
          bgClass: "bg-gradient-to-br from-blue-50 to-indigo-50",
          borderClass: "border-blue-200",
          iconClass: "text-blue-500",
          statusText: null,
        };
      case "recording":
        return {
          bgClass: "bg-gradient-to-br from-red-50 to-orange-50",
          borderClass: "border-red-300",
          iconClass: "text-red-500 animate-pulse",
          statusText: (
            <Badge
              status="processing"
              text="ĐANG PHÁT THANH"
              className="text-lg font-bold text-red-600"
            />
          ),
        };
      case "paused":
        return {
          bgClass: "bg-gradient-to-br from-amber-50 to-yellow-50",
          borderClass: "border-amber-300",
          iconClass: "text-amber-500",
          statusText: (
            <Badge
              status="warning"
              text="TẠM DỪNG"
              className="text-lg font-bold text-amber-600"
            />
          ),
        };
      case "completed":
        return {
          bgClass: "bg-gradient-to-br from-green-50 to-emerald-50",
          borderClass: "border-green-300",
          iconClass: "text-green-500",
          statusText: (
            <Badge
              status="success"
              text="ĐÃ KẾT THÚC"
              className="text-lg font-bold text-green-600"
            />
          ),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`${config.bgClass} ${config.borderClass} border-2 rounded-xl p-8 transition-all duration-300`}
    >
      {/* Status Badge */}
      {config.statusText && (
        <div className="flex justify-center mb-4">{config.statusText}</div>
      )}

      {/* Microphone Icon */}
      <div className="flex justify-center mb-6">
        <div
          className={`${config.iconClass} transition-all duration-300`}
          style={{ fontSize: "120px" }}
        >
          <AudioOutlined />
        </div>
      </div>

      {/* Idle State Message */}
      {status === "idle" && (
        <div className="text-center mb-6">
          <p className="text-xl text-gray-600 font-medium">
            Nhấn nút bên dưới để bắt đầu phát thanh
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Vui lòng chọn đơn vị và thiết bị trước khi bắt đầu
          </p>
        </div>
      )}

      {/* Waveform */}
      {status !== "idle" && (
        <div className="mb-6">
          <LiveBroadcastWaveform
            isRecording={status === "recording"}
            audioStream={audioStream}
            status={status}
          />
        </div>
      )}

      {/* Timer */}
      {status !== "idle" && (
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-gray-800">
            {formatTime(duration)}
          </div>
        </div>
      )}

      {/* Device Count */}
      {status === "recording" && deviceCount > 0 && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-red-200 shadow-sm">
            <span className="text-red-500 text-xl">📡</span>
            <span className="text-sm font-medium text-gray-700">
              Đang phát đến{" "}
              <span className="font-bold text-red-600">{deviceCount}</span>{" "}
              thiết bị
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center">
        <Space size="large">
          {status === "idle" && (
            <Button
              type="primary"
              danger
              size="large"
              icon={<AudioOutlined />}
              onClick={onStart}
              className="h-12 px-8 text-lg font-semibold"
            >
              Bắt đầu phát thanh
            </Button>
          )}

          {status === "recording" && (
            <>
              <Button
                size="large"
                icon={<PauseCircleOutlined />}
                onClick={onPause}
                className="h-12 px-6"
              >
                Tạm dừng
              </Button>
              <Button
                danger
                size="large"
                icon={<StopOutlined />}
                onClick={onStop}
                className="h-12 px-6"
              >
                Kết thúc
              </Button>
            </>
          )}

          {status === "paused" && (
            <>
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={onResume}
                className="h-12 px-6"
              >
                Tiếp tục
              </Button>
              <Button
                danger
                size="large"
                icon={<StopOutlined />}
                onClick={onStop}
                className="h-12 px-6"
              >
                Kết thúc
              </Button>
            </>
          )}

          {status === "completed" && (
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={onSave}
              className="h-12 px-8 text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              Lưu bản ghi
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};
