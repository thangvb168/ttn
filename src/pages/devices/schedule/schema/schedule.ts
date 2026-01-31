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
    sourceUrl: z.string().optional(), // Validate conditionally based on sourceType
    ttsContent: z.string().optional(),

    // Time Config
    startTime: z.date(),
    endTime: z.date().optional(),

    // Targeting
    targetUnitIds: z.array(z.string()),
    targetDeviceIds: z.array(z.string()),

    // Routine
    daysOfWeek: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      if (data.sourceType === ScheduleSourceType.TTS && !data.ttsContent) {
        return false;
      }
      if (data.sourceType !== ScheduleSourceType.TTS && !data.sourceUrl) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng nhập nội dung hoặc đường dẫn nguồn phát",
      path: ["sourceUrl"], // Point error to sourceUrl generally
    }
  );

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
