import type { Mastra } from '@mastra/core';
import type { Agent, Network } from '../types';

export async function getNetworksHandler(mastra: Mastra) {
  try {
    const networks = mastra.getNetworks();

    const serializedNetworks = networks.map((network: Network) => {
      const routingAgent = network.getRoutingAgent();
      const agents = network.getAgents();
      return {
        id: network.formatAgentId(routingAgent.name),
        name: routingAgent.name,
        instructions: routingAgent.instructions,
        agents: agents.map((agent: Agent) => ({
          name: agent.name,
          provider: agent.llm?.getProvider(),
          modelId: agent.llm?.getModelId(),
        })),
        routingModel: {
          provider: routingAgent.llm?.getProvider(),
          modelId: routingAgent.llm?.getModelId(),
        },
      };
    });

    return serializedNetworks;
  } catch (error) {
    throw new Error('Error getting networks');
  }
}

export async function getNetworkByIdHandler(mastra: Mastra, networkId: string) {
  try {
    const networks = mastra.getNetworks();

    const network = networks.find((network: Network) => {
      const routingAgent = network.getRoutingAgent();
      return network.formatAgentId(routingAgent.name) === networkId;
    });

    if (!network) {
      throw new Error('Network not found');
    }

    const routingAgent = network.getRoutingAgent();
    const agents = network.getAgents();

    const serializedNetwork = {
      id: network.formatAgentId(routingAgent.name),
      name: routingAgent.name,
      instructions: routingAgent.instructions,
      agents: agents.map((agent: Agent) => ({
        name: agent.name,
        provider: agent.llm?.getProvider(),
        modelId: agent.llm?.getModelId(),
      })),
      routingModel: {
        provider: routingAgent.llm?.getProvider(),
        modelId: routingAgent.llm?.getModelId(),
      },
    };

    return serializedNetwork;
  } catch (error) {
    throw new Error('Error getting network by ID');
  }
}

export async function generateHandler(mastra: Mastra, networkId: string, body: any): Promise<any> {
  try {
    const network = mastra.getNetwork(networkId);

    if (!network) {
      throw new Error('Network not found');
    }

    const { messages, threadId, resourceid, resourceId, output, runId, ...rest } = body;

    if (!messages) {
      throw new Error('Messages are required');
    }

    // Use resourceId if provided, fall back to resourceid (deprecated)
    const finalResourceId = resourceId ?? resourceid;

    const result = await network.generate(messages, { threadId, resourceId: finalResourceId, output, runId, ...rest });

    return result;
  } catch (error) {
    throw new Error('Error generating from network');
  }
}

export async function streamGenerateHandler(mastra: Mastra, networkId: string, body: any): Promise<any> {
  try {
    const network = mastra.getNetwork(networkId);

    if (!network) {
      throw new Error('Network not found');
    }

    const { messages, threadId, resourceid, resourceId, output, runId, ...rest } = body;

    if (!messages) {
      throw new Error('Messages are required');
    }

    // Use resourceId if provided, fall back to resourceid (deprecated)
    const finalResourceId = resourceId ?? resourceid;

    const streamResult = await network.stream(messages, {
      threadId,
      resourceId: finalResourceId,
      output,
      runId,
      ...rest,
    });

    return streamResult;
  } catch (error) {
    throw new Error('Error streaming from network');
  }
}
