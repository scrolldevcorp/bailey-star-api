import { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape } from "zod";

export type McpTool = {
  name: string;
  description: string;
  parameters: ZodRawShape;
  annotations: ToolAnnotations;
  execute: (args?: any, extra?: any) => Promise<any>;
};