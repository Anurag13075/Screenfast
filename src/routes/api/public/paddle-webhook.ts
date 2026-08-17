import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/paddle-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PADDLE_WEBHOOK_SECRET"];
        if (!secret) return new Response("webhook_not_configured", { status: 503 });

        const rawBody = await request.text();
        const { verifyPaddleSignature, handlePaddleEvent } = await import("@/lib/paddle-webhook.server");

        if (!verifyPaddleSignature(request.headers.get("paddle-signature"), rawBody, secret)) {
          return new Response("invalid_signature", { status: 401 });
        }

        let event: unknown;
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("invalid_json", { status: 400 });
        }

        try {
          const result = await handlePaddleEvent(event as never);
          return Response.json(result);
        } catch (error) {
          console.error("paddle webhook error", error);
          return new Response("processing_error", { status: 500 });
        }
      },
      GET: async () =>
        Response.json({ ok: true, endpoint: "paddle-webhook", method: "POST" }),
    },
  },
});
