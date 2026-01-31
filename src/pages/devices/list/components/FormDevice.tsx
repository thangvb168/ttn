import { Device, DeviceStatus } from "@/models/Device";
import { deviceService } from "@/services/device";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Slider,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DeviceFormValues, deviceSchema } from "../schema/device";
// Actually selecting Unit in a tree inside a form is nice, `TreeSelect`.
// For now, let's use a simple Input or Select for unitId, or assume user knows unit ID?
// Ideally we should use TreeSelect fetching units. I'll mock it or use simple Select for now.
import { mockUnits } from "@/mocks/mockUnit";
import { UnitType } from "@/models/Unit";
import { TreeSelect } from "antd";
import { buildTree } from "../utils/build-tree";

interface FormDeviceProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: DeviceFormValues) => Promise<void>;
  initialValues?: Device; // For edit mode
  loading?: boolean;
}

export const FormDevice: React.FC<FormDeviceProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors },
    setValue,
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema) as any,
    defaultValues: {
      status: DeviceStatus.ACTIVE,
      deviceConfig: { volume: 50 },
      hardwareInfo: { ipAddress: "", macAddress: "" },
    },
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "success" | "error" | null
  >(null);

  // Reset connection status when modal closes or IP changes
  useEffect(() => {
    if (!open) {
      setConnectionStatus(null);
    }
  }, [open]);

  const handleTestConnection = async () => {
    const ipAddress = getValues("hardwareInfo.ipAddress");
    const isIpValid = await trigger("hardwareInfo.ipAddress");

    if (!isIpValid || !ipAddress) {
      message.error("Vui lòng nhập địa chỉ IP hợp lệ để kiểm tra kết nối");
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      const result = await deviceService.testConnection({ ipAddress });
      if (result.success) {
        message.success(result.message);
        setConnectionStatus("success");
      } else {
        message.error(result.message);
        setConnectionStatus("error");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi kiểm tra kết nối");
      setConnectionStatus("error");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Prepare Tree Data for Unit selection
  const [treeData, setTreeData] = React.useState<any[]>([]);
  useEffect(() => {
    const units = mockUnits
      .getAll()
      .filter((u) => u.type === UnitType.DEPARTMENT); // Show departments only? or all?
    // Let's use buildTree utility, assuming it returns DataNode[] compatible with TreeSelect
    const tree = buildTree(units);
    setTreeData(tree);
  }, []);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        // Fill form for Edit
        // Need to map Device to DeviceFormValues structure
        // Using setValue for deep objects safety
        reset({
          code: initialValues.code,
          name: initialValues.name,
          unitId: initialValues.unitId,
          status: initialValues.status,
          hardwareInfo: {
            ipAddress: initialValues.hardwareInfo.ipAddress,
            macAddress: initialValues.hardwareInfo.macAddress,
            serialNumber: initialValues.hardwareInfo.serialNumber,
            modelName: initialValues.hardwareInfo.modelName,
            manufacturer: initialValues.hardwareInfo.manufacturer,
            firmwareVersion: initialValues.hardwareInfo.firmwareVersion,
          },
          deviceConfig: {
            volume: initialValues.deviceConfig.volume,
          },
          location: initialValues.location,
        });
      } else {
        // Reset for Add
        reset({
          status: DeviceStatus.ACTIVE,
          deviceConfig: { volume: 50 },
          hardwareInfo: { ipAddress: "", macAddress: "" },
          code: "",
          name: "",
          unitId: "",
        });
      }
    }
  }, [open, initialValues, reset]);

  const onFinish: SubmitHandler<DeviceFormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      title={initialValues ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit((data) => onFinish(data))}
        >
          Lưu
        </Button>,
      ]}
      width={800}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mã thiết bị"
              validateStatus={errors.code ? "error" : ""}
              help={errors.code?.message}
              required
            >
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Nhập mã thiết bị" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên thiết bị"
              validateStatus={errors.name ? "error" : ""}
              help={errors.name?.message}
              required
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Nhập tên thiết bị" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Đơn vị quản lý"
              validateStatus={errors.unitId ? "error" : ""}
              help={errors.unitId?.message}
              required
            >
              <Controller
                name="unitId"
                control={control}
                render={({ field }) => (
                  <TreeSelect
                    {...field}
                    treeData={treeData}
                    placeholder="Chọn đơn vị"
                    treeDefaultExpandAll
                    allowClear
                    showSearch
                    treeNodeFilterProp="title"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng thái"
              validateStatus={errors.status ? "error" : ""}
              help={errors.status?.message}
            >
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <Select.Option value={DeviceStatus.ACTIVE}>
                      Đang hoạt động
                    </Select.Option>
                    <Select.Option value={DeviceStatus.INACTIVE}>
                      Đã tắt
                    </Select.Option>
                    <Select.Option value={DeviceStatus.ERROR}>
                      Lỗi
                    </Select.Option>
                    <Select.Option value={DeviceStatus.MAINTENANCE}>
                      Bảo trì
                    </Select.Option>
                    <Select.Option value={DeviceStatus.IDLE}>
                      Nhàn rỗi
                    </Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Thông tin phần cứng" style={{ marginBottom: 0 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="MAC Address"
                validateStatus={errors.hardwareInfo?.macAddress ? "error" : ""}
                help={errors.hardwareInfo?.macAddress?.message}
                required
              >
                <Controller
                  name="hardwareInfo.macAddress"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="00:00:00:00:00:00" />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="IP Address"
                validateStatus={errors.hardwareInfo?.ipAddress ? "error" : ""}
                help={errors.hardwareInfo?.ipAddress?.message}
              >
                <Controller
                  name="hardwareInfo.ipAddress"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <Input
                        {...field}
                        placeholder="192.168.1.1"
                        onChange={(e) => {
                          field.onChange(e);
                          if (connectionStatus) setConnectionStatus(null);
                        }}
                      />
                      <Button
                        type="dashed"
                        size="middle"
                        icon={
                          isTestingConnection ? (
                            <LoadingOutlined />
                          ) : connectionStatus === "success" ? (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          ) : connectionStatus === "error" ? (
                            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                          ) : (
                            <WifiOutlined />
                          )
                        }
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="w-full"
                      >
                        {isTestingConnection
                          ? "Đang kiểm tra..."
                          : connectionStatus === "success"
                          ? "Kết nối thành công"
                          : connectionStatus === "error"
                          ? "Kết nối thất bại"
                          : "Thử kết nối"}
                      </Button>
                    </div>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label="Âm lượng mặc định">
          <Controller
            name="deviceConfig.volume"
            control={control}
            render={({ field }) => (
              <Row>
                <Col span={16}>
                  <Slider
                    min={0}
                    max={100}
                    onChange={field.onChange}
                    value={typeof field.value === "number" ? field.value : 0}
                  />
                </Col>
                <Col span={6} offset={2}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ margin: "0 16px" }}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </Col>
              </Row>
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
