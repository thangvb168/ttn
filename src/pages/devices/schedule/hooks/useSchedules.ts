import { mockSchedules } from "@/mocks/mockSchedule";
import { useQuery } from "@tanstack/react-query";

export const useSchedules = () => {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockSchedules.getAll();
    },
  });
};
