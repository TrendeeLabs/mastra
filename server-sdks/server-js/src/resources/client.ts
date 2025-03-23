const clients = new Set<ReadableStreamDefaultController>();

export function handleClientsRefresh(): { stream: ReadableStream<any>; headers: Record<string, string> } {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      controller.enqueue('data: connected\n\n');

      // Note: In the SDK version, the client is responsible for cleaning up
      return () => {
        clients.delete(controller);
      };
    },
  });

  return {
    stream,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  };
}

export function handleTriggerClientsRefresh() {
  clients.forEach(controller => {
    try {
      controller.enqueue('data: refresh\n\n');
    } catch {
      clients.delete(controller);
    }
  });
  return { success: true, clients: clients.size };
}
