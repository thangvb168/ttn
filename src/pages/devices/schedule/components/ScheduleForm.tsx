import { mockDevices } from "@/mocks/mockDevice";
import { mockUnits } from "@/mocks/mockUnit";
import { ScheduleSourceType, ScheduleType } from "@/models/Schedule";
import { UnitType } from "@/models/Unit";
import { buildTree } from "@/pages/devices/list/utils/build-tree";
import {
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  StepsForm,
} from "@ant-design/pro-components";
import { Modal, message } from "antd";
import dayjs from "dayjs";
import React, { useRef } from "react";
import { ScheduleFormValues } from "../schema/schedule";

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
  const formRef = useRef<any>(null);

  const onFinish = async (values: ScheduleFormValues) => {
    // Transform logic if needed
    console.log("Form Submit:", values);
    onSubmit(values);
    message.success(
      initialValues ? "Cập nhật lịch thành công!" : "Tạo lịch thành công!"
    );
    return true;
  };

  const unitTreeData = buildTree(
    mockUnits.getAll().filter((u) => u.type !== UnitType.EMPLOYEE)
  );

  return (
    <StepsForm<ScheduleFormValues>
      formRef={formRef}
      onFinish={onFinish}
      formProps={{
        validateMessages: {
          required: "Vui lòng nhập ${label}!",
        },
      }}
      stepsProps={{
        size: "small",
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            title={initialValues ? "Cập nhật lịch phát" : "Tạo lịch phát mới"}
            width={800}
            onCancel={onCancel}
            open={open}
            footer={submitter}
            destroyOnClose
          >
            {dom}
          </Modal>
        );
      }}
    >
      {/* STEP 1: GENERAL INFO */}
      <StepsForm.StepForm
        name="step1" // unique name
        title="Thông tin chung"
        initialValues={initialValues}
      >
        <ProForm.Group>
          <ProFormText
            name="title"
            label="Tên lịch phát"
            // width="md" // Removed to fill width
            placeholder="Nhập tên lịch phát..."
            rules={[{ required: true }]}
            colProps={{ span: 16 }} // Use Col span for layout control
          />
          <ProFormSelect
            name="type"
            label="Loại lịch"
            // width="sm" // Removed
            options={[
              {
                label: "Định kỳ (Hàng ngày/Tuần)",
                value: ScheduleType.ROUTINE,
              },
              { label: "Một lần", value: ScheduleType.ONE_TIME },
              { label: "Khẩn cấp", value: ScheduleType.EMERGENCY },
            ]}
            rules={[{ required: true }]}
            initialValue={ScheduleType.ROUTINE}
            colProps={{ span: 8 }}
          />
        </ProForm.Group>

        <ProFormTextArea
          name="description"
          label="Mô tả"
          placeholder="Mô tả nội dung..."
        />

        <ProFormDigit
          name="priority"
          label="Độ ưu tiên (1-10)"
          width="xs"
          min={1}
          max={10}
          initialValue={5}
        />
      </StepsForm.StepForm>

      {/* STEP 2: SOURCE CONFIG */}
      <StepsForm.StepForm
        name="step2"
        title="Nguồn phát"
        initialValues={initialValues}
      >
        <ProFormRadio.Group
          name="sourceType"
          label="Chọn nguồn phát"
          options={[
            { label: "File Audio", value: ScheduleSourceType.FILE },
            { label: "Tiếp sóng", value: ScheduleSourceType.STREAM },
            { label: "Chuyển văn bản (TTS)", value: ScheduleSourceType.TTS },
          ]}
          initialValue={ScheduleSourceType.FILE}
        />

        <ProFormDependency name={["sourceType"]}>
          {({ sourceType }) => {
            if (sourceType === ScheduleSourceType.FILE) {
              return (
                <ProFormText
                  name="fileUrl"
                  label="Đường dẫn File"
                  placeholder="Chọn hoặc nhập link file..."
                />
              );
            }
            if (sourceType === ScheduleSourceType.STREAM) {
              return (
                <ProFormText
                  name="streamUrl"
                  label="Luồng tiếp sóng"
                  placeholder="Nhập URL stream..."
                />
              );
            }
            if (sourceType === ScheduleSourceType.TTS) {
              return (
                <ProFormTextArea
                  name="ttsContent"
                  label="Nội dung văn bản"
                  placeholder="Nhập nội dung cần chuyển thành giọng nói..."
                />
              );
            }
            return null;
          }}
        </ProFormDependency>
      </StepsForm.StepForm>

      {/* STEP 3: PREPARE TARGET & TIME */}
      <StepsForm.StepForm
        name="step3"
        title="Phạm vi & Thời gian"
        initialValues={{
          ...initialValues,
          // Ensure dates are dayjs if present
          startTime: initialValues?.startTime
            ? dayjs(initialValues.startTime)
            : undefined,
          endTime: initialValues?.endTime
            ? dayjs(initialValues.endTime)
            : undefined,
        }}
      >
        <ProFormTreeSelect
          name="targetUnitIds"
          label="Chọn Đơn vị / Địa bàn"
          placeholder="Chọn đơn vị..."
          allowClear
          // width="md" // Remove width constraint
          treeData={unitTreeData}
          fieldProps={{
            treeCheckable: true,
            showCheckedStrategy: "SHOW_PARENT",
            treeDefaultExpandAll: true, // Ensure we see data if hierarchy is deep
          }}
        />

        <ProFormDependency name={["targetUnitIds"]}>
          {({ targetUnitIds }) => {
            // Filter devices based on selected units
            const unitIds = targetUnitIds || [];
            const filteredDevices = mockDevices
              .getAll()
              .filter((d) => unitIds.length === 0 || unitIds.includes(d.unitId))
              .map((d) => ({
                label: `${d.name} (${d.hardwareInfo?.ipAddress})`,
                value: d.id,
              }));

            return (
              <ProFormSelect
                name="targetDeviceIds"
                label="Chọn Thiết bị (Để trống = Chọn tất cả trong đơn vị)"
                mode="multiple"
                placeholder="Chọn thiết bị cụ thể..."
                options={filteredDevices}
              />
            );
          }}
        </ProFormDependency>

        <ProForm.Group title="Thời gian">
          <ProFormDependency name={["type"]}>
            {({ type }) => {
              const isRoutine = type === ScheduleType.ROUTINE;
              return (
                <>
                  <ProFormDatePicker
                    name="endTime"
                    label="Kết thúc"
                    showTime
                    width="md"
                  />

                  {isRoutine && (
                    <ProFormCheckbox.Group
                      name="daysOfWeek"
                      label="Lặp lại"
                      options={[
                        { label: "T2", value: 1 },
                        { label: "T3", value: 2 },
                        { label: "T4", value: 3 },
                        { label: "T5", value: 4 },
                        { label: "T6", value: 5 },
                        { label: "T7", value: 6 },
                        { label: "CN", value: 0 },
                      ]}
                    />
                  )}
                </>
              );
            }}
          </ProFormDependency>
        </ProForm.Group>
      </StepsForm.StepForm>
    </StepsForm>
  );
};
