import type { Mastra } from '@mastra/core/';
import { stringify } from 'superjson';
import zodToJsonSchema from 'zod-to-json-schema';

export async function getAgentsHandler(mastra: Mastra) {
  try {
    const agents = mastra.getAgents();
    const serializedAgents = Object.entries(agents).reduce<any>((acc, [_id, _agent]) => {
      const agent = _agent as any;
      const serializedAgentTools = Object.entries(agent?.tools || {}).reduce<any>((acc, [key, tool]) => {
        const _tool = tool as any;
        acc[key] = {
          ..._tool,
          inputSchema: _tool.inputSchema ? stringify(zodToJsonSchema(_tool.inputSchema)) : undefined,
          outputSchema: _tool.outputSchema ? stringify(zodToJsonSchema(_tool.outputSchema)) : undefined,
        };
        return acc;
      }, {});
      acc[_id] = {
        name: agent.name,
        instructions: agent.instructions,
        tools: serializedAgentTools,
        provider: agent.llm?.getProvider(),
        modelId: agent.llm?.getModelId(),
      };
      return acc;
    }, {});
    return serializedAgents;
  } catch (error) {
    throw new Error('Error getting agents');
  }
}

export async function getAgentByIdHandler(mastra: Mastra, agentId: string) {
  try {
    const agent = mastra.getAgent(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    const serializedAgentTools = Object.entries(agent?.tools || {}).reduce<any>((acc, [key, tool]) => {
      const _tool = tool as any;
      acc[key] = {
        ..._tool,
        inputSchema: _tool.inputSchema ? stringify(zodToJsonSchema(_tool.inputSchema)) : undefined,
        outputSchema: _tool.outputSchema ? stringify(zodToJsonSchema(_tool.outputSchema)) : undefined,
      };
      return acc;
    }, {});

    return {
      name: agent.name,
      instructions: agent.instructions,
      tools: serializedAgentTools,
      provider: agent.llm?.getProvider(),
      modelId: agent.llm?.getModelId(),
    };
  } catch (error) {
    throw new Error('Error getting agent');
  }
}

export async function getEvalsByAgentIdHandler(mastra: Mastra, agentId: string) {
  try {
    const agent = mastra.getAgent(agentId);
    const evals = (await mastra.storage?.getEvalsByAgentName?.(agent.name, 'test')) || [];
    return {
      id: agentId,
      name: agent.name,
      instructions: agent.instructions,
      evals,
    };
  } catch (error) {
    throw new Error('Error getting test evals');
  }
}

export async function getLiveEvalsByAgentIdHandler(mastra: Mastra, agentId: string) {
  try {
    const agent = mastra.getAgent(agentId);
    const evals = (await mastra.storage?.getEvalsByAgentName?.(agent.name, 'live')) || [];
    return {
      id: agentId,
      name: agent.name,
      instructions: agent.instructions,
      evals,
    };
  } catch (error) {
    throw new Error('Error getting live evals');
  }
}

export async function generateHandler(mastra: Mastra, agentId: string, body: any): Promise<any> {
  try {
    const agent = mastra.getAgent(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    const { messages, threadId, resourceid, resourceId, output, runId, ...rest } = body;

    if (!messages) {
      throw new Error('Missing required fields');
    }

    // Use resourceId if provided, fall back to resourceid (deprecated)
    const finalResourceId = resourceId ?? resourceid;

    const result = await agent.generate(messages, { threadId, resourceId: finalResourceId, output, runId, ...rest });

    return result;
  } catch (error) {
    throw new Error('Error generating from agent');
  }
}

export async function streamGenerateHandler(mastra: Mastra, agentId: string, body: any): Promise<any> {
  try {
    const agent = mastra.getAgent(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    const { messages, threadId, resourceid, resourceId, output, runId, ...rest } = body;

    if (!messages) {
      throw new Error('Missing required fields');
    }

    // Use resourceId if provided, fall back to resourceid (deprecated)
    const finalResourceId = resourceId ?? resourceid;

    const streamResult = await agent.stream(messages, {
      threadId,
      resourceId: finalResourceId,
      output,
      runId,
      ...rest,
    });

    const streamResponse = output
      ? streamResult.toTextStreamResponse()
      : streamResult.toDataStreamResponse({
          sendUsage: true,
          sendReasoning: true,
          getErrorMessage: (error: any) => {
            return `An error occurred while processing your request. ${error instanceof Error ? error.message : JSON.stringify(error)}`;
          },
        });

    return streamResponse;
  } catch (error) {
    throw new Error('Error streaming from agent');
  }
}

export async function setAgentInstructionsHandler(
  mastra: Mastra,
  agentId: string,
  body: any,
  isPlayground: boolean = false,
) {
  try {
    // Check if this is a playground request
    if (!isPlayground) {
      throw new Error('This API is only available in the playground environment');
    }

    const { instructions } = body;

    if (!agentId || !instructions) {
      throw new Error('Missing required fields');
    }

    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    agent.__updateInstructions(instructions);

    return {
      instructions,
    };
  } catch (error) {
    throw new Error('Error setting agent instructions');
  }
}
