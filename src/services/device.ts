export interface TestConnectionParams {
  ipAddress: string;
  port?: number;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export const deviceService = {
  testConnection: async (
    params: TestConnectionParams
  ): Promise<TestConnectionResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate random success/failure or specific failure for "fail" IP
    if (params.ipAddress === "0.0.0.0" || params.ipAddress.includes("fail")) {
      return {
        success: false,
        message: "Không thể kết nối đến thiết bị (Connection Timed Out)",
      };
    }

    return {
      success: true,
      message: "Kết nối thành công",
    };
  },
};
