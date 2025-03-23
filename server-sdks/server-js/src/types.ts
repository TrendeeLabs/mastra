export interface Agent {
  name: string;
  instructions: string;
  llm?: {
    getProvider: () => string;
    getModelId: () => string;
  };
}

export interface Network {
  formatAgentId: (name: string) => string;
  getRoutingAgent: () => Agent;
  getAgents: () => Agent[];
  stepGraph?: any;
  stepSubscriberGraph?: any;
}

export interface WorkflowStep {
  inputSchema?: any;
  outputSchema?: any;
  [key: string]: any;
}

export interface Workflow {
  name: string;
  stepGraph: any;
  stepSubscriberGraph: any;
  serializedStepGraph: any;
  serializedStepSubscriberGraph: any;
  triggerSchema?: any;
  steps: Record<string, WorkflowStep>;
}

export interface WatchEventData {
  activePaths: any;
  context: any;
  runId: string;
  timestamp: number;
  suspendedSteps?: any;
}
