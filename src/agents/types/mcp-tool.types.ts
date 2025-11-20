// src/agents/mcp/types.ts
import { z } from "zod";

export type McpTool = {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args?: any, extra?: any) => Promise<any>;
};