import { Readable } from 'stream';
import type { Mastra } from '@mastra/core';

/**
 * Get available speakers for an agent
 */
export async function getSpeakersHandler(mastra: Mastra, agentId: string) {
  try {
    const agent = mastra.getAgent(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.voice) {
      throw new Error('Agent does not have voice capabilities');
    }

    const speakers = await agent.getSpeakers();
    return speakers;
  } catch (error) {
    throw new Error('Error getting speakers');
  }
}

/**
 * Convert text to speech using the agent's voice provider
 */
export async function speakHandler(mastra: Mastra, agentId: string, input: string, options?: any) {
  try {
    const agent = mastra.getAgent(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.voice) {
      throw new Error('Agent does not have voice capabilities');
    }

    if (!input) {
      throw new Error('Input is required');
    }

    const audioStream = await agent.voice.speak(input, options);
    return {
      stream: audioStream,
      contentType: `audio/${options?.filetype ?? 'mp3'}`,
    };
  } catch (error) {
    throw new Error('Error generating speech');
  }
}

/**
 * Convert speech to text using the agent's voice provider
 */
export async function listenHandler(mastra: Mastra, agentId: string, audioData: ArrayBuffer, options?: any) {
  try {
    const agent = mastra.getAgent(agentId);
    const logger = mastra.getLogger();

    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.voice) {
      throw new Error('Agent does not have voice capabilities');
    }

    if (!audioData) {
      throw new Error('Audio data is required');
    }

    const audioStream = new Readable();
    audioStream.push(Buffer.from(audioData));
    audioStream.push(null);

    let parsedOptions = options || {};
    if (typeof parsedOptions === 'string') {
      try {
        parsedOptions = JSON.parse(parsedOptions);
      } catch (error) {
        if (error instanceof SyntaxError) {
          logger.error('Invalid JSON in options:', error);
        }
        parsedOptions = {};
      }
    }

    const transcription = await agent.voice.listen(audioStream, parsedOptions);
    return { text: transcription };
  } catch (error) {
    throw new Error('Error transcribing speech');
  }
}
