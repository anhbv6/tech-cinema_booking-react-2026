import { z } from "zod";

export const reportGroupBySchema = z.enum(["day", "month"]);

export const reportOverviewQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  groupBy: reportGroupBySchema.default("day"),
});

export type ReportGroupByInput = z.infer<typeof reportGroupBySchema>;
export type ReportOverviewQueryInput = z.infer<
  typeof reportOverviewQuerySchema
>;