import type { Mastra } from '@mastra/core';
import type { MastraStorage } from '@mastra/core/storage';
import type { Telemetry } from '@mastra/core/telemetry';

export async function getTelemetryHandler(
  mastra: Mastra,
  options: {
    name?: string;
    scope?: string;
    page?: number;
    perPage?: number;
    attribute?: string | string[];
  },
) {
  try {
    const telemetry: Telemetry | undefined = mastra.getTelemetry();
    const storage: MastraStorage | undefined = mastra.getStorage();
    const { name, scope, page = 0, perPage = 100, attribute } = options;

    if (!telemetry) {
      throw new Error('Telemetry is not initialized');
    }

    if (!storage) {
      throw new Error('Storage is not initialized');
    }

    // Parse attribute query parameter if present
    const attributes = attribute
      ? Object.fromEntries(
          (Array.isArray(attribute) ? attribute : [attribute]).map(attr => {
            const [key, value] = attr.split(':');
            return [key, value];
          }),
        )
      : undefined;

    const traces = await storage.getTraces({
      name,
      scope,
      page: Number(page),
      perPage: Number(perPage),
      attributes,
    });

    return { traces };
  } catch (error) {
    throw new Error('Error getting telemetry data');
  }
}
