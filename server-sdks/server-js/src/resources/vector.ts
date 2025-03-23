import type { Mastra } from '@mastra/core';
import type { MastraVector, QueryResult, IndexStats } from '@mastra/core/vector';

interface UpsertRequest {
  indexName: string;
  vectors: number[][];
  metadata?: Record<string, any>[];
  ids?: string[];
}

interface CreateIndexRequest {
  indexName: string;
  dimension: number;
  metric?: 'cosine' | 'euclidean' | 'dotproduct';
}

interface QueryRequest {
  indexName: string;
  queryVector: number[];
  topK?: number;
  filter?: Record<string, any>;
  includeVector?: boolean;
}

function getVector(mastra: Mastra, vectorName: string): MastraVector {
  const vector = mastra.getVector(vectorName);
  if (!vector) {
    throw new Error(`Vector store ${vectorName} not found`);
  }
  return vector;
}

// Upsert vectors
export async function upsertVectors(mastra: Mastra, vectorName: string, data: UpsertRequest) {
  try {
    const { indexName, vectors, metadata, ids } = data;

    if (!indexName || !vectors || !Array.isArray(vectors)) {
      throw new Error('Invalid request body. indexName and vectors array are required.');
    }

    const vector = getVector(mastra, vectorName);
    const result = await vector.upsert({ indexName, vectors, metadata, ids });
    return { ids: result };
  } catch (error) {
    throw new Error('Error upserting vectors');
  }
}

// Create index
export async function createIndex(mastra: Mastra, vectorName: string, data: CreateIndexRequest) {
  try {
    const { indexName, dimension, metric } = data;

    if (!indexName || typeof dimension !== 'number' || dimension <= 0) {
      throw new Error('Invalid request body. indexName and positive dimension number are required.');
    }

    if (metric && !['cosine', 'euclidean', 'dotproduct'].includes(metric)) {
      throw new Error('Invalid metric. Must be one of: cosine, euclidean, dotproduct');
    }

    const vector = getVector(mastra, vectorName);
    await vector.createIndex({ indexName, dimension, metric });
    return { success: true };
  } catch (error) {
    throw new Error('Error creating index');
  }
}

// Query vectors
export async function queryVectors(mastra: Mastra, vectorName: string, data: QueryRequest) {
  try {
    const { indexName, queryVector, topK = 10, filter, includeVector = false } = data;

    if (!indexName || !queryVector || !Array.isArray(queryVector)) {
      throw new Error('Invalid request body. indexName and queryVector array are required.');
    }

    const vector = getVector(mastra, vectorName);
    const results: QueryResult[] = await vector.query({ indexName, queryVector, topK, filter, includeVector });
    return { results };
  } catch (error) {
    throw new Error('Error querying vectors');
  }
}

// List indexes
export async function listIndexes(mastra: Mastra, vectorName: string) {
  try {
    const vector = getVector(mastra, vectorName);

    const indexes = await vector.listIndexes();
    return { indexes: indexes.filter(Boolean) };
  } catch (error) {
    throw new Error('Error listing indexes');
  }
}

// Describe index
export async function describeIndex(mastra: Mastra, vectorName: string, indexName: string) {
  try {
    if (!indexName) {
      throw new Error('Index name is required');
    }

    const vector = getVector(mastra, vectorName);
    const stats: IndexStats = await vector.describeIndex(indexName);

    return {
      dimension: stats.dimension,
      count: stats.count,
      metric: stats.metric?.toLowerCase(),
    };
  } catch (error) {
    throw new Error('Error describing index');
  }
}

// Delete index
export async function deleteIndex(mastra: Mastra, vectorName: string, indexName: string) {
  try {
    if (!indexName) {
      throw new Error('Index name is required');
    }

    const vector = getVector(mastra, vectorName);
    await vector.deleteIndex(indexName);
    return { success: true };
  } catch (error) {
    throw new Error('Error deleting index');
  }
}
