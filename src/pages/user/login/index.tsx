import { LockOutlined, SoundOutlined, UserOutlined } from "@ant-design/icons";
import { useModel } from "@umijs/max";
import { Alert, Button, Checkbox, Form, Input, message } from "antd";
import React, { useState } from "react";
import { flushSync } from "react-dom";
import "./style.css";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { initialState, setInitialState } = useModel("@@initialState");
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => {
    setLoading(true);
    setError(false);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Mock login - check credentials
      if (values.username === "admin" && values.password === "123456") {
        // Mock user info
        const mockUserInfo = {
          name: "Admin",
          avatar:
            "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
          userid: "00000001",
          email: "admin@system.com",
          signature: "Quản trị viên hệ thống",
          title: "Quản trị viên",
          group: "Hệ thống Truyền thanh",
          access: "admin",
          currentAuthority: "admin",
        };

        // Save to localStorage
        localStorage.setItem("currentUser", JSON.stringify(mockUserInfo));

        // Set user info to global state
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: mockUserInfo,
          }));
        });

        message.success("Đăng nhập thành công!");

        // Redirect to home
        setTimeout(() => {
          const urlParams = new URL(window.location.href).searchParams;
          window.location.href = urlParams.get("redirect") || "/";
        }, 500);
      } else {
        // Login failed
        setError(true);
        message.error("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } catch (err) {
      console.error("Login error:", err);
      message.error("Đăng nhập thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Animation */}
      <div className="login-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo and Title */}
        <div className="login-header">
          <div className="logo-container">
            <SoundOutlined className="logo-icon" />
          </div>
          <h1 className="login-title">Hệ thống Truyền thanh</h1>
          <p className="login-subtitle">Đăng nhập để tiếp tục</p>
        </div>

        {/* Demo Notice */}
        <div className="demo-notice">
          <div className="demo-badge">DEMO</div>
          <p className="demo-text">
            Phiên bản demo - Thông tin đăng nhập đã được điền sẵn
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert
            message="Tên đăng nhập hoặc mật khẩu không đúng"
            description="Vui lòng sử dụng: admin / 123456"
            type="error"
            showIcon
            closable
            onClose={() => setError(false)}
            className="login-error"
          />
        )}

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          initialValues={{
            username: "admin",
            password: "123456",
            remember: true,
          }}
          onFinish={handleSubmit}
          size="large"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên đăng nhập!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="Tên đăng nhập"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Mật khẩu"
              className="login-input"
            />
          </Form.Item>

          <Form.Item>
            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a className="forgot-password" href="#">
                Quên mật khẩu?
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
              block
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form.Item>
        </Form>

        {/* Footer Info */}
        <div className="login-footer">
          <p className="copyright">
            © 2026 Hệ thống Truyền thanh. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
