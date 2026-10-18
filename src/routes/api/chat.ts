import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import type { Database } from "@/integrations/supabase/types";
import { createResponsesCall } from "@/server/ai/responses";
import { withLovableAiGatewayRunIdHeader } from "@/server/ai/run-id";

const SYSTEM = `You are Aurum, a refined, warm and precise AI concierge. Answer with clarity and elegance. Use concise markdown (short paragraphs, lists, code blocks when useful). Never be verbose without reason.`;

function userClient(token: string) {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        h.set("apikey", key);
        h.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });
        const sb = userClient(token);
        const { data: u, error: uErr } = await sb.auth.getUser(token);
        if (uErr || !u.user) return new Response("Unauthorized", { status: 401 });
        const userId = u.user.id;

        const body = (await request.json()) as { messages?: UIMessage[] };
        const messages = Array.isArray(body.messages) ? body.messages.slice(-60) : [];
        if (!messages.length) return new Response("No messages", { status: 400 });

        const last = messages[messages.length - 1];
        if (last.role === "user") {
          const { error } = await sb.from("chat_messages").upsert(
            { user_id: userId, message_id: last.id, role: "user", message: last as never },
            { onConflict: "user_id,message_id" },
          );
          if (error) console.error("save user message", error);
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI not configured", { status: 500 });

        const { result, runIdFetch } = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          SYSTEM,
        );

        const res = result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onFinish: async ({ responseMessage }) => {
            const { error } = await sb.from("chat_messages").upsert(
              {
                user_id: userId,
                message_id: responseMessage.id,
                role: "assistant",
                message: responseMessage as never,
              },
              { onConflict: "user_id,message_id" },
            );
            if (error) console.error("save assistant message", error);
          },
          onError: (e) => (e instanceof Error ? e.message : "Something went wrong"),
        });
        return withLovableAiGatewayRunIdHeader(res, runIdFetch);
      },
    },
  },
});
