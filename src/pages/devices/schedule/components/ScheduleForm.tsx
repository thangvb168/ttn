import { mockDevices } from "@/mocks/mockDevice";
import { mockUnits } from "@/mocks/mockUnit";
import { ScheduleSourceType, ScheduleType } from "@/models/Schedule";
import { UnitType } from "@/models/Unit";
import { buildTree } from "@/pages/devices/list/utils/build-tree";
import { UploadOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Segmented,
  Select,
  TreeSelect,
  Upload,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScheduleFormValues, scheduleSchema } from "../schema/schedule";
import { RelaySourceSelector } from "./RelaySourceSelector";

interface ScheduleFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: ScheduleFormValues) => void;
  initialValues?: Partial<ScheduleFormValues>;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      type: ScheduleType.ROUTINE,
      priority: 5,
      sourceType: ScheduleSourceType.FILE,
      targetUnitIds: [],
      targetDeviceIds: [],
      ...initialValues,
    },
  });

  // Watch values for conditional rendering
  const sourceType = watch("sourceType");
  const targetUnitIds = watch("targetUnitIds");
  const type = watch("type");

  // Segment state for filtering (All / Unit / Relay)
  const [scheduleCategory, setScheduleCategory] = React.useState<
    "all" | "unit" | "relay"
  >("unit");

  useEffect(() => {
    if (open) {
      if (initialValues) {
        // Map initial values to form fields
        const formattedValues = {
          ...initialValues,
          startTime: initialValues.startTime
            ? dayjs(initialValues.startTime)
            : undefined,
          endTime: initialValues.endTime
            ? dayjs(initialValues.endTime)
            : undefined,
          // If editing, we might need to separate sourceUrl back to fileUrl/streamUrl
          fileUrl:
            initialValues.sourceType === ScheduleSourceType.FILE
              ? initialValues.sourceUrl
              : undefined,
          streamUrl:
            initialValues.sourceType === ScheduleSourceType.STREAM
              ? initialValues.sourceUrl
              : undefined,
        };
        // @ts-ignore - dayjs type mismatch with zod date sometimes needs explicit casting or just ignoring in quick resets if valid
        reset(formattedValues);
      } else {
        reset({
          type: ScheduleType.ROUTINE,
          priority: 5,
          sourceType: ScheduleSourceType.FILE,
          targetUnitIds: [],
          targetDeviceIds: [],
        });
      }
    }
  }, [open, initialValues, reset]);

  const onFinish = (data: ScheduleFormValues) => {
    // Transform fileUrl/streamUrl back to sourceUrl
    let finalData = { ...data };
    if (data.sourceType === ScheduleSourceType.FILE) {
      finalData.sourceUrl = data.fileUrl;
    } else if (data.sourceType === ScheduleSourceType.STREAM) {
      finalData.sourceUrl = data.streamUrl;
    }

    const payload = {
      ...finalData,
      startTime: (finalData.startTime as any)?.toDate
        ? (finalData.startTime as any).toDate()
        : finalData.startTime,
      endTime: (finalData.endTime as any)?.toDate
        ? (finalData.endTime as any).toDate()
        : finalData.endTime,
    };

    console.log("Form Submit:", payload);
    onSubmit(payload as ScheduleFormValues);
    message.success(
      initialValues ? "Cập nhật lịch thành công!" : "Tạo lịch thành công!"
    );
    onCancel();
  };

  const unitTreeData = buildTree(
    mockUnits.getAll().filter((u) => u.type !== UnitType.EMPLOYEE)
  );

  // Filter devices logic
  const filteredDevices = React.useMemo(() => {
    const unitIds = targetUnitIds || [];
    return mockDevices
      .getAll()
      .filter((d) => unitIds.length === 0 || unitIds.includes(d.unitId))
      .map((d) => ({
        label: `${d.name} (${d.hardwareInfo?.ipAddress})`,
        value: d.id,
      }));
  }, [targetUnitIds]);

  return (
    <Modal
      title={initialValues ? "Cập nhật lịch phát" : "Tạo lịch phát mới"}
      width={800}
      open={open}
      onCancel={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" onClick={handleSubmit(onFinish)}>
            {initialValues ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      }
      destroyOnHidden
    >
      <Form layout="vertical" className="mt-4">
        {/* CARD 1: GENERAL INFO */}

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              label="Tên lịch phát"
              validateStatus={errors.title ? "error" : ""}
              help={errors.title?.message}
              required
            >
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Nhập tên lịch phát..." />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Loại lịch"
              validateStatus={errors.type ? "error" : ""}
              help={errors.type?.message}
              required
            >
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      {
                        label: "Định kỳ (Hàng ngày/Tuần)",
                        value: ScheduleType.ROUTINE,
                      },
                      { label: "Một lần", value: ScheduleType.ONE_TIME },
                      { label: "Khẩn cấp", value: ScheduleType.EMERGENCY },
                    ]}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Mô tả">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="Mô tả nội dung..."
                rows={5}
              />
            )}
          />
        </Form.Item>

        {/* CARD 2: SOURCE CONFIG */}
        <Form.Item label="Loại lịch phát">
          <Segmented
            value={scheduleCategory}
            onChange={(value: string | number) => {
              setScheduleCategory(value as "all" | "unit" | "relay");
              // Auto-switch sourceType based on category
              if (value === "relay") {
                setValue("sourceType", ScheduleSourceType.RELAY);
              } else if (value === "unit") {
                setValue("sourceType", ScheduleSourceType.FILE);
              }
            }}
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Đơn vị", value: "unit" },
              { label: "Tiếp sóng", value: "relay" },
            ]}
            block
          />
        </Form.Item>

        <Form.Item label="Chọn nguồn phát">
          <Controller
            name="sourceType"
            control={control}
            render={({ field }) => (
              <Radio.Group
                {...field}
                options={
                  scheduleCategory === "relay"
                    ? [
                        {
                          label: "Tiếp sóng từ cấp trên",
                          value: ScheduleSourceType.RELAY,
                        },
                      ]
                    : scheduleCategory === "unit"
                    ? [
                        { label: "File Audio", value: ScheduleSourceType.FILE },
                        {
                          label: "Chuyển văn bản (TTS)",
                          value: ScheduleSourceType.TTS,
                        },
                      ]
                    : [
                        { label: "File Audio", value: ScheduleSourceType.FILE },
                        {
                          label: "Chuyển văn bản (TTS)",
                          value: ScheduleSourceType.TTS,
                        },
                        {
                          label: "Tiếp sóng từ cấp trên",
                          value: ScheduleSourceType.RELAY,
                        },
                      ]
                }
              />
            )}
          />
        </Form.Item>

        {sourceType === ScheduleSourceType.FILE && (
          <Form.Item
            label="Đường dẫn File"
            required
            validateStatus={errors.fileUrl ? "error" : ""}
            help={errors.fileUrl?.message}
          >
            <Controller
              name="fileUrl"
              control={control}
              render={({ field }) => (
                <Upload
                  name={field.name}
                  accept="audio/*"
                  maxCount={1}
                  beforeUpload={(file) => {
                    const url = URL.createObjectURL(file);
                    field.onChange(url);
                    return false;
                  }}
                  onRemove={() => {
                    field.onChange("");
                  }}
                  fileList={
                    field.value
                      ? [
                          {
                            uid: "-1",
                            name: "Audio File",
                            status: "done",
                            url: field.value,
                          },
                        ]
                      : []
                  }
                >
                  <Button icon={<UploadOutlined />}>Chọn file Audio</Button>
                </Upload>
              )}
            />
          </Form.Item>
        )}

        {sourceType === ScheduleSourceType.TTS && (
          <Form.Item
            label="Nội dung văn bản"
            required
            validateStatus={errors.ttsContent ? "error" : ""}
            help={errors.ttsContent?.message}
          >
            <Controller
              name="ttsContent"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={4}
                  placeholder="Nhập nội dung cần chuyển thành giọng nói..."
                />
              )}
            />
          </Form.Item>
        )}

        {sourceType === ScheduleSourceType.RELAY && (
          <RelaySourceSelector
            sourceUnitId={watch("sourceUnitId")}
            sourceChannelId={watch("sourceChannelId")}
            relayFromLevel={watch("relayFromLevel")}
            onSourceUnitChange={(value) => setValue("sourceUnitId", value)}
            onSourceChannelChange={(value) =>
              setValue("sourceChannelId", value)
            }
            onRelayLevelChange={(value) => setValue("relayFromLevel", value)}
            errors={{
              sourceUnitId: errors.sourceUnitId?.message,
              sourceChannelId: errors.sourceChannelId?.message,
            }}
          />
        )}

        {/* CARD 3: TARGET & TIME */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Chọn Đơn vị / Địa bàn"
              validateStatus={errors.targetUnitIds ? "error" : ""}
              help={errors.targetUnitIds?.message}
            >
              <Controller
                name="targetUnitIds"
                control={control}
                render={({ field }) => (
                  <TreeSelect
                    {...field}
                    treeData={unitTreeData}
                    treeCheckable
                    showCheckedStrategy={TreeSelect.SHOW_PARENT}
                    placeholder="Chọn đơn vị..."
                    treeDefaultExpandAll
                    allowClear
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Chọn Thiết bị (Để trống = Chọn tất cả)">
              <Controller
                name="targetDeviceIds"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    mode="multiple"
                    options={filteredDevices}
                    placeholder="Chọn thiết bị cụ thể..."
                    allowClear
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Bắt đầu"
              required
              validateStatus={errors.startTime ? "error" : ""}
              help={errors.startTime?.message}
            >
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <DatePicker {...field} showTime className="w-full" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Kết thúc">
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <DatePicker {...field} showTime className="w-full" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
