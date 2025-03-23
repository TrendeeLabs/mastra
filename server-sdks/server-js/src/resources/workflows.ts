import type { Mastra } from '@mastra/core';
import { stringify } from 'superjson';
import zodToJsonSchema from 'zod-to-json-schema';
import type { Workflow, WorkflowStep, WatchEventData } from '../types';

export async function getWorkflowsHandler(mastra: Mastra) {
  try {
    const workflows = mastra.getWorkflows({ serialized: false });
    const _workflows = Object.entries(workflows).reduce<any>((acc, [key, workflow]) => {
      const typedWorkflow = workflow as Workflow;
      acc[key] = {
        stepGraph: typedWorkflow.stepGraph,
        stepSubscriberGraph: typedWorkflow.stepSubscriberGraph,
        serializedStepGraph: typedWorkflow.serializedStepGraph,
        serializedStepSubscriberGraph: typedWorkflow.serializedStepSubscriberGraph,
        name: typedWorkflow.name,
        triggerSchema: typedWorkflow.triggerSchema
          ? stringify(zodToJsonSchema(typedWorkflow.triggerSchema))
          : undefined,
        steps: Object.entries(typedWorkflow.steps).reduce<any>((acc, [key, step]) => {
          const _step = step as WorkflowStep;
          acc[key] = {
            ..._step,
            inputSchema: _step.inputSchema ? stringify(zodToJsonSchema(_step.inputSchema)) : undefined,
            outputSchema: _step.outputSchema ? stringify(zodToJsonSchema(_step.outputSchema)) : undefined,
          };
          return acc;
        }, {}),
      };
      return acc;
    }, {});
    return _workflows;
  } catch (error) {
    throw new Error('Error getting workflows');
  }
}

export async function getWorkflowByIdHandler(mastra: Mastra, workflowId: string) {
  try {
    const workflow = mastra.getWorkflow(workflowId) as Workflow;

    const triggerSchema = workflow?.triggerSchema;
    const stepGraph = workflow.stepGraph;
    const stepSubscriberGraph = workflow.stepSubscriberGraph;
    const serializedStepGraph = workflow.serializedStepGraph;
    const serializedStepSubscriberGraph = workflow.serializedStepSubscriberGraph;
    const serializedSteps = Object.entries(workflow.steps).reduce<any>((acc, [key, step]) => {
      const _step = step as WorkflowStep;
      acc[key] = {
        ..._step,
        inputSchema: _step.inputSchema ? stringify(zodToJsonSchema(_step.inputSchema)) : undefined,
        outputSchema: _step.outputSchema ? stringify(zodToJsonSchema(_step.outputSchema)) : undefined,
      };
      return acc;
    }, {});

    return {
      name: workflow.name,
      triggerSchema: triggerSchema ? stringify(zodToJsonSchema(triggerSchema)) : undefined,
      steps: serializedSteps,
      stepGraph,
      stepSubscriberGraph,
      serializedStepGraph,
      serializedStepSubscriberGraph,
    };
  } catch (error) {
    throw new Error('Error getting workflow');
  }
}

export async function startAsyncWorkflowHandler(mastra: Mastra, workflowId: string, runId: string, triggerData: any) {
  try {
    const workflow = mastra.getWorkflow(workflowId);

    if (!runId) {
      throw new Error('runId required to start run');
    }

    const run = workflow.getRun(runId);

    if (!run) {
      throw new Error('Workflow run not found');
    }

    const result = await run.start({
      triggerData,
    });
    return result;
  } catch (error) {
    throw new Error('Error executing workflow');
  }
}

export async function createRunHandler(mastra: Mastra, workflowId: string, prevRunId?: string) {
  try {
    const workflow = mastra.getWorkflow(workflowId);
    const { runId } = workflow.createRun({ runId: prevRunId });

    return { runId };
  } catch (error) {
    throw new Error('Error creating run');
  }
}

export async function startWorkflowRunHandler(mastra: Mastra, workflowId: string, runId: string, triggerData: any) {
  try {
    const workflow = mastra.getWorkflow(workflowId);

    if (!runId) {
      throw new Error('runId required to start run');
    }

    const run = workflow.getRun(runId);

    if (!run) {
      throw new Error('Workflow run not found');
    }

    run.start({
      triggerData,
    });

    return { message: 'Workflow run started' };
  } catch (error) {
    throw new Error('Error starting workflow run');
  }
}

export async function watchWorkflowHandler(
  mastra: Mastra,
  workflowId: string,
  runId: string,
  onEvent: (data: any) => void,
  onError?: (error: any) => void,
) {
  try {
    const logger = mastra.getLogger();
    const workflow = mastra.getWorkflow(workflowId);

    if (!runId) {
      throw new Error('runId required to watch workflow');
    }

    const run = workflow.getRun(runId);

    if (!run) {
      throw new Error('Workflow run not found');
    }

    return new Promise<void>((_, reject) => {
      try {
        const unwatch = run.watch(state => {
          // Forward the state as the event data
          onEvent({
            activePaths: state.activePaths,
            context: state.context,
            runId: state.runId,
            timestamp: state.timestamp,
            suspendedSteps: state.suspendedSteps,
          });
        });

        return () => {
          unwatch?.();
        };
      } catch (error) {
        logger.error('Error in watch stream: ' + (error as Error)?.message);
        if (onError) {
          onError(error);
        }
        reject(error);
      }
    });
  } catch (error) {
    throw new Error('Error watching workflow');
  }
}

export async function resumeAsyncWorkflowHandler(
  mastra: Mastra,
  workflowId: string,
  runId: string,
  stepId: string,
  context: any,
) {
  try {
    const workflow = mastra.getWorkflow(workflowId);

    if (!runId) {
      throw new Error('runId required to resume workflow');
    }

    const run = workflow.getRun(runId);

    if (!run) {
      throw new Error('Workflow run not found');
    }

    const result = await run.resume({
      stepId,
      context,
    });

    return result;
  } catch (error) {
    throw new Error('Error resuming workflow step');
  }
}

export async function resumeWorkflowHandler(
  mastra: Mastra,
  workflowId: string,
  runId: string,
  stepId: string,
  context: any,
) {
  try {
    const workflow = mastra.getWorkflow(workflowId);

    if (!runId) {
      throw new Error('runId required to resume workflow');
    }

    const run = workflow.getRun(runId);

    if (!run) {
      throw new Error('Workflow run not found');
    }

    run.resume({
      stepId,
      context,
    });

    return { message: 'Workflow run resumed' };
  } catch (error) {
    throw new Error('Error resuming workflow');
  }
}
