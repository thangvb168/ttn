import { ScheduleSourceType, ScheduleType } from "@/models/Schedule";
import { z } from "zod";

export const scheduleSchema = z
  .object({
    title: z
      .string()
      .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
      .max(100, "Tiêu đề không quá 100 ký tự"),
    description: z.string().optional(),
    type: z.nativeEnum(ScheduleType),
    priority: z.number().min(1).max(10),

    // Source Config
    sourceType: z.nativeEnum(ScheduleSourceType),
    sourceUrl: z.string().optional(),
    fileUrl: z.string().optional(),
    streamUrl: z.string().optional(),
    ttsContent: z.string().optional(),

    // Relay Broadcasting Config
    sourceUnitId: z.string().optional(),
    sourceChannelId: z.string().optional(),
    relayFromLevel: z.enum(["PROVINCE", "DISTRICT", "COMMUNE"]).optional(),

    // Time Config
    startTime: z.date({
      error: "Vui lòng chọn thời gian bắt đầu",
      // invalid_type_error: "Thời gian bắt đầu không hợp lệ",
    }),
    endTime: z.date().optional(),

    // Targeting
    targetUnitIds: z
      .array(z.string())
      .min(1, "Vui lòng chọn ít nhất một đơn vị"),
    targetDeviceIds: z.array(z.string()),

    // Routine
    daysOfWeek: z.array(z.number()).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate TTS content
    if (data.sourceType === ScheduleSourceType.TTS) {
      if (!data.ttsContent || data.ttsContent.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập nội dung văn bản",
          path: ["ttsContent"],
        });
      }
    }
    // Validate FILE source
    else if (data.sourceType === ScheduleSourceType.FILE) {
      if (!data.fileUrl || data.fileUrl.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập đường dẫn file",
          path: ["fileUrl"],
        });
      }
    }
    // Validate STREAM source
    else if (data.sourceType === ScheduleSourceType.STREAM) {
      if (!data.streamUrl || data.streamUrl.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập đường dẫn stream",
          path: ["streamUrl"],
        });
      }
    }
    // Validate RELAY source
    else if (data.sourceType === ScheduleSourceType.RELAY) {
      if (!data.sourceUnitId || data.sourceUnitId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn đơn vị nguồn",
          path: ["sourceUnitId"],
        });
      }
      if (!data.sourceChannelId || data.sourceChannelId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn kênh phát sóng",
          path: ["sourceChannelId"],
        });
      }
    }
  });

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
