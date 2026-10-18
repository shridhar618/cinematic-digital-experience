import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion } from "motion/react";
import { LogOut, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mark from "@/assets/aurum-mark.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Conversation — Aurum" },
      { name: "description", content: "Your private conversation with Aurum, the AI concierge." },
      { property: "og:title", content: "Conversation — Aurum" },
      { property: "og:description", content: "Your private conversation with Aurum." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("message")
      .order("created_at")
      .then(({ data, error }) => {
        if (error) console.error(error);
        setInitial((data ?? []).map((r) => r.message as unknown as UIMessage));
      });
  }, []);
  if (!initial) return <div className="flex min-h-screen items-center justify-center"><Shimmer>Opening your conversation…</Shimmer></div>;
  return <ChatWindow initial={initial} />;
}

const SUGGESTIONS = ["Plan a slow weekend in Kyoto", "Explain black holes like I'm curious", "Write a gracious thank-you note"];

function ChatWindow({ initial }: { initial: UIMessage[] }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: "aurum",
    messages: initial,
    transport,
    onError: (e) => setError(/429/.test(e.message) ? "Too many requests — please wait a moment." : /402/.test(e.message) ? "AI credits are exhausted." : e.message || "Something went wrong."),
  });
  const busy = status === "submitted" || status === "streaming";

  const send = (t: string) => {
    if (!t.trim() || busy) return;
    setError(null);
    sendMessage({ text: t });
    setText("");
  };

  async function reset() {
    if (busy) stop();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { error } = await supabase.from("chat_messages").delete().eq("user_id", data.user.id);
    if (error) setError(error.message);
    else setMessages([]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="grain relative flex h-[100svh] flex-col">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[50rem] -translate-x-1/2 rounded-full bg-gold-soft blur-[140px]" />
      <header className="relative z-10 flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={mark} alt="" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-2xl">Aurum</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={reset} title="New conversation" className="flex h-9 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">New conversation</span>
          </button>
          <button onClick={signOut} title="Sign out" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <Conversation className="relative z-10 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-6 py-10">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center pt-[12vh] text-center">
              <motion.img src={mark} alt="Aurum" width={96} height={96} className="mb-8 h-24 w-24" animate={{ rotate: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
              <h1 className="font-display text-5xl md:text-6xl">What shall we <span className="italic text-gold-gradient">explore?</span></h1>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : "bg-transparent px-0 text-[15px] leading-relaxed"}>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      m.role === "assistant" ? <MessageResponse key={i}>{p.text}</MessageResponse> : <span key={i} className="whitespace-pre-wrap">{p.text}</span>
                    ) : p.type === "reasoning" && p.text ? (
                      <details key={i} className="mb-2 text-xs text-muted-foreground"><summary className="cursor-pointer eyebrow">Reasoning</summary><p className="mt-2 whitespace-pre-wrap">{p.text}</p></details>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-6">
        <PromptInput onSubmit={({ text: t }) => send(t ?? "")} className="rounded-2xl border-border bg-card/70 backdrop-blur">
          <PromptInputTextarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Aurum anything…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} className="bg-primary text-primary-foreground" />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-3 text-center eyebrow">Aurum can make mistakes. Verify what matters.</p>
      </div>
    </div>
  );
}
