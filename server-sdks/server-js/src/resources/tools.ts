import type { Mastra } from '@mastra/core';
import { isVercelTool } from '@mastra/core';
import { stringify } from 'superjson';
import zodToJsonSchema from 'zod-to-json-schema';

export async function getToolsHandler(tools: Record<string, any>) {
  try {
    if (!tools) {
      return {};
    }

    const serializedTools = Object.entries(tools).reduce(
      (acc, [id, _tool]) => {
        const tool = _tool as any;
        acc[id] = {
          ...tool,
          inputSchema: tool.inputSchema ? stringify(zodToJsonSchema(tool.inputSchema)) : undefined,
          outputSchema: tool.outputSchema ? stringify(zodToJsonSchema(tool.outputSchema)) : undefined,
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    return serializedTools;
  } catch (error) {
    throw new Error('Error getting tools');
  }
}

export async function getToolByIdHandler(tools: Record<string, any>, toolId: string) {
  try {
    const tool = Object.values(tools || {}).find((tool: any) => tool.id === toolId) as any;

    if (!tool) {
      throw new Error('Tool not found');
    }

    const serializedTool = {
      ...tool,
      inputSchema: tool.inputSchema ? stringify(zodToJsonSchema(tool.inputSchema)) : undefined,
      outputSchema: tool.outputSchema ? stringify(zodToJsonSchema(tool.outputSchema)) : undefined,
    };

    return serializedTool;
  } catch (error) {
    throw new Error('Error getting tool');
  }
}

export async function executeToolHandler(tools: Record<string, any>, mastra: Mastra, toolId: string, data: any) {
  try {
    const tool = Object.values(tools || {}).find((tool: any) => tool.id === toolId) as any;

    if (!tool) {
      throw new Error('Tool not found');
    }

    if (!tool?.execute) {
      throw new Error('Tool is not executable');
    }

    if (isVercelTool(tool)) {
      const result = await (tool as any).execute(data);
      return result;
    }

    const result = await tool.execute({
      context: data,
      mastra,
      // @ts-ignore
      runId: mastra.runId,
    });

    return result;
  } catch (error) {
    throw new Error('Error executing tool');
  }
}

export async function executeAgentToolHandler(mastra: Mastra, agentId: string, toolId: string, data: any) {
  try {
    const agent = mastra.getAgent(agentId);
    const tool = Object.values(agent?.tools || {}).find((tool: any) => tool.id === toolId) as any;

    if (!tool) {
      throw new Error('Tool not found');
    }

    if (!tool?.execute) {
      throw new Error('Tool is not executable');
    }

    if (isVercelTool(tool)) {
      const result = await (tool as any).execute(data);
      return result;
    }

    const result = await tool.execute({
      context: data,
      mastra,
      runId: agentId,
    });

    return result;
  } catch (error) {
    throw new Error('Error executing tool');
  }
}
