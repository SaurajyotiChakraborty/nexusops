'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
}

interface AIAssistantPanelProps {
    deploymentId: string
    projectName: string
    buildLogs: string
    onClose: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export function AIAssistantPanel({
    deploymentId,
    projectName,
    buildLogs,
    onClose,
}: AIAssistantPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isInitializing, setIsInitializing] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Initialize chat on mount
    useEffect(() => {
        const initChat = async () => {
            try {
                const res = await fetch(`${API_URL}/ai-ops/chat/${deploymentId}/init`, { method: 'POST' })
                if (res.ok) {
                    const history: ChatMessage[] = await res.json()
                    setMessages(history.filter(m => m.role !== 'system'))
                }
            } catch {
                // Fallback welcome message
                setMessages([{
                    role: 'assistant',
                    content: `Hi! I'm here to help debug the deployment for **${projectName}**.\n\nI can see the build logs. Ask me about the error, what caused it, or how to fix it.`,
                    timestamp: new Date().toISOString(),
                }])
            } finally {
                setIsInitializing(false)
            }
        }
        initChat()
    }, [deploymentId, projectName])

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || isLoading) return

        const userMsg: ChatMessage = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch(`${API_URL}/ai-ops/chat/${deploymentId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            })
            if (res.ok) {
                const data = await res.json()
                setMessages(prev => [...prev, data.reply])
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I had trouble connecting. Please try again.',
                timestamp: new Date().toISOString(),
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md h-[600px] flex flex-col rounded-2xl border border-purple-500/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-purple-900/30 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/50 to-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">AI Debug Assistant</p>
                            <p className="text-xs text-slate-400">{projectName}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isInitializing ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading context...
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                    msg.role === 'user'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-gradient-to-br from-purple-500 to-blue-500'
                                }`}>
                                    {msg.role === 'user'
                                        ? <User className="w-3.5 h-3.5" />
                                        : <Bot className="w-3.5 h-3.5 text-white" />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${ 
                                        msg.role === 'user'
                                            ? 'bg-blue-600/20 text-blue-100 rounded-tr-sm border border-blue-500/20'
                                            : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/40'
                                    }`}>
                                        {msg.content.split('\n').map((line, li) => {
                                            const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
                                            return (
                                                <span key={li}>
                                                    {parts.map((part, pi) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={pi} className="font-semibold text-white">{part.slice(2, -2)}</strong>
                                                        }
                                                        if (part.startsWith('`') && part.endsWith('`')) {
                                                            return <code key={pi} className="font-mono text-xs bg-slate-700/50 px-1 rounded">{part.slice(1, -1)}</code>
                                                        }
                                                        return <span key={pi}>{part}</span>
                                                    })}
                                                    {li < msg.content.split('\n').length - 1 && <br />}
                                                </span>
                                            )
                                        })}
                                    </div>

                                    {/* Timestamp */}
                                    <span className="text-[10px] text-slate-600">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                                <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex gap-1.5">
                                    {[0,1,2].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                                            style={{ animationDelay: `${i * 150}ms` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-800">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about the error, what caused it..."
                                rows={1}
                                className="w-full resize-none bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all max-h-32 overflow-y-auto"
                                style={{ height: 'auto', minHeight: '44px' }}
                                onInput={e => {
                                    const el = e.target as HTMLTextAreaElement
                                    el.style.height = 'auto'
                                    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
                                }}
                            />
                        </div>
                        <Button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="h-11 w-11 shrink-0 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 rounded-xl"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 text-center">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    )
}
