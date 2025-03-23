import type { Mastra } from '@mastra/core';
import type { MastraMemory } from '@mastra/core/memory';

function getMemoryFromMastra(mastra: Mastra, agentId?: string): MastraMemory | null | undefined {
  const agent = agentId ? mastra.getAgent(agentId) : null;

  if (agentId && !agent) {
    throw new Error('Agent not found');
  }

  const memory = agent?.getMemory?.() || mastra.memory;

  return memory;
}

export async function getMemoryStatusHandler(mastra: Mastra, agentId?: string) {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);

    if (!memory) {
      return { result: false };
    }

    return { result: true };
  } catch (error) {
    throw new Error('Error getting memory status');
  }
}

export async function getThreadsHandler(mastra: Mastra, resourceId: string, agentId?: string) {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);

    if (!memory) {
      throw new Error('Memory is not initialized');
    }

    if (!resourceId) {
      throw new Error('Resource ID is required');
    }

    const threads = await memory.getThreadsByResourceId({ resourceId });
    return threads;
  } catch (error) {
    throw new Error('Error getting threads');
  }
}

export async function getThreadByIdHandler(mastra: Mastra, threadId: string, agentId?: string) {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);

    if (!memory) {
      throw new Error('Memory is not initialized');
    }

    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new Error('Thread not found');
    }

    return thread;
  } catch (error) {
    throw new Error('Error getting thread');
  }
}

export async function saveMessagesHandler(mastra: Mastra, messages: any[], agentId?: string) {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);

    if (!memory) {
      throw new Error('Memory is not initialized');
    }

    if (!Array.isArray(messages)) {
      throw new Error('Messages should be an array');
    }

    const processedMessages = messages.map(message => ({
      ...message,
      id: memory.generateId(),
      createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
    }));

    const result = await memory.saveMessages({ messages: processedMessages, memoryConfig: {} });
    return result;
  } catch (error) {
    throw new Error('Error saving messages');
  }
}

export async function createThreadHandler(
  mastra: Mastra,
  resourceId: string,
  title?: string,
  metadata?: any,
  threadId?: string,
  agentId?: string,
) {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);

    if (!memory) {
      throw new Error('Memory is not initialized');
    }

    if (!resourceId) {
      throw new Error('Resource ID is required');
    }

    const result = await memory.createThread({ resourceId, title, metadata, threadId });
    return result;
  } catch (error) {
    throw new Error('Error saving thread to memory');
  }
}

export async function updateThreadHandler(
  mastra: Mastra,
  threadId: string,
  data: { title?: string; metadata?: any; resourceId?: string },
  agentId?: string,
) {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);
    const { title, metadata, resourceId } = data;
    const updatedAt = new Date();

    if (!memory) {
      throw new Error('Memory is not initialized');
    }

    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new Error('Thread not found');
    }

    const updatedThread = {
      ...thread,
      title: title || thread.title,
      metadata: metadata || thread.metadata,
      resourceId: resourceId || thread.resourceId,
      createdAt: thread.createdAt,
      updatedAt,
    };

    const result = await memory.saveThread({ thread: updatedThread });
    return result;
  } catch (error) {
    throw new Error('Error updating thread');
  }
}

export async function deleteThreadHandler(mastra: Mastra, threadId: string, agentId?: string) {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);

    if (!memory) {
      throw new Error('Memory is not initialized');
    }

    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new Error('Thread not found');
    }

    await memory.deleteThread(threadId);
    return { result: 'Thread deleted' };
  } catch (error) {
    throw new Error('Error deleting thread');
  }
}

export async function getMessagesHandler(mastra: Mastra, threadId: string, agentId?: string): Promise<any> {
  try {
    const memory = getMemoryFromMastra(mastra, agentId);

    if (!memory) {
      throw new Error('Memory is not initialized');
    }

    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new Error('Thread not found');
    }

    const result = await memory.query({ threadId });
    return result;
  } catch (error) {
    throw new Error('Error getting messages');
  }
}
