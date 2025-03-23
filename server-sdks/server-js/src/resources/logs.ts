import type { Mastra } from '@mastra/core';

export async function getLogsHandler(mastra: Mastra, transportId: string) {
  try {
    if (!transportId) {
      throw new Error('transportId is required');
    }

    const logs = await mastra.getLogs(transportId);
    return logs;
  } catch (error) {
    throw new Error('Error getting logs');
  }
}

export async function getLogsByRunIdHandler(mastra: Mastra, runId: string, transportId: string) {
  try {
    if (!transportId) {
      throw new Error('transportId is required');
    }

    const logs = await mastra.getLogsByRunId({ runId, transportId });
    return logs;
  } catch (error) {
    throw new Error('Error getting logs by run ID');
  }
}

export async function getLogTransports(mastra: Mastra) {
  try {
    const logger = mastra.getLogger();
    const transports = logger.transports;
    return {
      transports: Object.keys(transports),
    };
  } catch (error) {
    throw new Error('Error getting log Transports');
  }
}
