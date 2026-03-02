"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Message = {
  id: string;
  senderType: string;
  content: string;
  createdAt: string;
};

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const t = useTranslations("chat");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, mutate } = useSWR(
    `/api/chat/${roomId}/messages`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const messages: Message[] = data?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/chat/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      setMessage("");
      mutate();
    } catch {
      // error handled silently
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-surface-border mb-4">
        <Link href="/panel/mensajes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="font-heading font-semibold">{t("title")}</h2>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 px-2 py-4"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className={`h-12 rounded-xl ${i % 2 === 0 ? "w-2/3 ml-auto" : "w-2/3"}`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("noRooms")}
          </div>
        ) : (
          messages.map((msg) => {
            const isOperator = msg.senderType === "operator";
            return (
              <div
                key={msg.id}
                className={`flex ${isOperator ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    isOperator
                      ? "bg-brand-secondary text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOperator ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-surface-border pt-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("typeMessage")}
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !message.trim()}
            className="bg-gradient-primary text-white rounded-button self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
