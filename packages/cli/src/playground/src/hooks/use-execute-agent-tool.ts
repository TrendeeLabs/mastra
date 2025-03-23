import { useState } from 'react';

export const useExecuteTool = () => {
  const [isExecutingTool, setIsExecutingTool] = useState(false);

  const executeTool = async ({ agentId, toolId, input }: { agentId: string; toolId: string; input: any }) => {
    try {
      setIsExecutingTool(true);
      const response = await fetch(
        (import.meta.env.VITE_MASTRA_SERVER_BASE_URL || '') + `/api/agents/${agentId}/tools/${toolId}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: input }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error executing tool: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing tool:', error);
      throw error;
    } finally {
      setIsExecutingTool(false);
    }
  };

  return { executeTool, isExecutingTool };
};
