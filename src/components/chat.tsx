'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import { useChat } from "@ai-sdk/react"
import { cn } from '@/lib/utils'
import { DefaultChatTransport } from 'ai'
import { mapChatHistory } from '@/lib/ai'
import useChatHistory from '@/hooks/chat/useChatHistory'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { MarkdownRenderer } from './pages/chat/MarkdownRender'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

export function FloatingAIChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  const { data: messages, refetch, isLoading } = useChatHistory()
  const {
    messages: chatMessages, sendMessage,
    stop, status,
    setMessages
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }),
    // onFinish: () => {
    //   refetch();
    // },
    messages: mapChatHistory(messages),

  });
  useEffect(() => {
    if (!isLoading && messages) {
      setMessages(mapChatHistory(messages));
    }
  }, [messages, isLoading, setMessages]);
  const deleteChat = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        toast.success("Berhasil hapus chat")
        refetch()
        setMessages([])
        return
      }
      toast.error("Gagal hapus chat")
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan')
    }
  }

  return (
    <div className='fixed pointer-events-none h-[100dvh] w-full max-w-md z-50'>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'absolute pointer-events-auto bottom-32 right-6 z-50',
          'flex size-14 items-center justify-center',
          'rounded-full bg-white text-primary-foreground',
          'shadow-lg shadow-black/20',
          'transition-all duration-200',
          'hover:scale-105 hover:shadow-xl',
        )}
        aria-label="Open AI assistant"
      >
        <Sparkles className="size-6" />
      </button>

      {/* Chat window */}
      {open && (
        <div
          className={cn(
            "pointer-events-auto absolute bottom-32 right-6 z-50 flex flex-col",
            "h-[min(580px,calc(100vh-48px))] w-full max-w-[380px]",
            "overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50",
            "shadow-[0_20px_50px_rgba(8,_112,_184,_0.12)] transition-all duration-300"
          )}
        >

          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  <Bot className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">
                    AI Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {messages.length > 0 &&
                  <button
                    type="button"
                    onClick={deleteChat}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 className="size-5 text-red-500" />
                  </button>}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                  title="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((m: any) => {
                const text = m.parts
                  ?.filter((p: any) => p.type === "text")
                  .map((p: any) => p.text)
                  .join("");

                const isUser = m.role === "user";
                const reasoning = m.parts
                  ?.filter((p: any) => p.type === "reasoning")
                  .map((p: any) => p.text)
                  .join("");

                const isStreaming = status === "streaming";
                return (
                  <div
                    key={m.id}
                    className={cn("flex", isUser ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm max-w-[85%] leading-relaxed transition-all",
                        isUser
                          ? "bg-blue-600 text-white rounded-br-xs font-normal"
                          : "bg-slate-100 text-slate-800 rounded-bl-xs dark:bg-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50"
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{text}</p>
                      ) : (
                        <div className="flex flex-col gap-2">

                          {reasoning && (
                            <Collapsible
                              defaultOpen
                              className="rounded-lg"
                            >
                              <CollapsibleTrigger className="flex w-full items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium">
                                  {isStreaming ? "Thinking..." : "Thought process"}
                                </span>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="mt-2 max-h-60 overflow-y-auto border-l-2 border-slate-300 pl-3 text-xs leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400 whitespace-pre-wrap">
                                  {reasoning}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          {/* Final answer */}
                          {text && <MarkdownRenderer content={text} />}

                          {m.toolInvocations?.map((tool: any) => (
                            <Popover key={tool.toolCallId}>
                              <PopoverTrigger>
                                <div className="mt-2 text-xs flex items-center gap-2 px-2.5 py-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-xs">
                                  {tool.state === "call" && (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                      <span>Executing {tool.toolName}...</span>
                                    </>
                                  )}

                                  {tool.state === "result" && (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                      <span>Finished {tool.toolName}</span>
                                    </>
                                  )}
                                </div>
                              </PopoverTrigger>

                              <PopoverContent
                                side="top"
                                align="start"
                                className="w-[300px] text-xs p-3 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl"
                              >
                                <div className="space-y-2.5">
                                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                                    {tool.toolName}
                                  </div>

                                  {tool.args && (
                                    <div>
                                      <div className="text-slate-400 mb-1 font-medium text-[11px]">
                                        Arguments
                                      </div>
                                      <pre className="bg-slate-100 dark:bg-slate-800/80 rounded-lg p-2 overflow-x-auto text-[11px] font-mono text-slate-700 dark:text-slate-300">
                                        {JSON.stringify(tool.args, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {Array.isArray(tool.result?.residents) && (
                                    <div className="space-y-1">
                                      <p className="font-medium text-slate-500 dark:text-slate-400 text-[11px]">
                                        Residents
                                      </p>
                                      {tool.result.residents.map(
                                        (t: any, i: number) => (
                                          <div
                                            key={i}
                                            className="font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-700/50"
                                          >
                                            {t.title}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming / thinking indicator */}
              {(status === "submitted") && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-xs px-3.5 py-2 text-xs bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input section */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!input || input.trim().length === 0) return;
                  sendMessage(
                    { text: input },
                    {
                      body: {
                        text: input,
                      },
                    }
                  );
                  setInput("");
                }}
                className="flex w-full items-center gap-2"
              >
                <Input
                  placeholder="Ask something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-sm focus-visible:ring-2 focus-visible:ring-blue-600"
                  disabled={status === "streaming"}
                />

                {status === "streaming" ? (
                  <Button
                    type="button"
                    size="icon"
                    onClick={stop}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 shrink-0"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input || input.trim().length === 0}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shrink-0 transition-all active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
