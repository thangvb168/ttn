import { ScheduleSourceType } from "@/models/Schedule";
import {
  CloudUploadOutlined,
  LinkOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Progress, Radio, message } from "antd";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

const { TextArea } = Input;

export const SourceSelector: React.FC = () => {
  const { control, watch, setValue } = useFormContext();
  const sourceType = watch("sourceType");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleMockUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setValue("sourceUrl", "https://mock-s3.com/uploaded-file.mp3");
          message.success("Upload thành công!");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <Card title="Nguồn phát" className="mb-4" size="small">
      <Controller
        name="sourceType"
        control={control}
        render={({ field }) => (
          <Radio.Group
            {...field}
            buttonStyle="solid"
            className="mb-4 w-full flex"
          >
            <Radio.Button
              value={ScheduleSourceType.FILE}
              className="flex-1 text-center"
            >
              <CloudUploadOutlined /> File Audio
            </Radio.Button>
            <Radio.Button
              value={ScheduleSourceType.STREAM}
              className="flex-1 text-center"
            >
              <LinkOutlined /> Tiếp sóng (Stream)
            </Radio.Button>
            <Radio.Button
              value={ScheduleSourceType.TTS}
              className="flex-1 text-center"
            >
              <SoundOutlined /> Chuyển văn bản (TTS)
            </Radio.Button>
          </Radio.Group>
        )}
      />

      <div className="p-4 border rounded bg-gray-50">
        {sourceType === ScheduleSourceType.FILE && (
          <div className="text-center">
            <Button
              icon={<CloudUploadOutlined />}
              onClick={handleMockUpload}
              loading={uploading}
            >
              Chọn file tải lên (S3/MinIO)
            </Button>
            {progress > 0 && (
              <Progress percent={progress} size="small" className="mt-2" />
            )}
            <Controller
              name="sourceUrl"
              control={control}
              render={({ field }) =>
                field.value ? (
                  <div className="mt-2 text-green-600">File: {field.value}</div>
                ) : (
                  <></>
                )
              }
            />
          </div>
        )}

        {sourceType === ScheduleSourceType.STREAM && (
          <Controller
            name="sourceUrl"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                prefix={<LinkOutlined />}
                placeholder="Nhập đường dẫn luồng (HLS/RTSP/HTTP)..."
              />
            )}
          />
        )}

        {sourceType === ScheduleSourceType.TTS && (
          <Controller
            name="ttsContent"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={4}
                placeholder="Nhập nội dung cần chuyển thành giọng nói..."
                showCount
                maxLength={1000}
              />
            )}
          />
        )}
      </div>
    </Card>
  );
};
