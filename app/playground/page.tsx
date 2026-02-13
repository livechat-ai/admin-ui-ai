"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

type Message = {
    role: "visitor" | "assistant";
    content: string;
    confidence?: number;
    tokenUsage?: number;
    processingTime?: number;
    chunks?: Array<{ score: number; content: string; documentTitle: string }>;
};

export default function PlaygroundPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Config
    const [tenantSlug, setTenantSlug] = useState("test-tenant");
    const [responseStyle, setResponseStyle] = useState("friendly");
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
    const [aiDisplayName, setAiDisplayName] = useState("AI Assistant");

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            role: "visitor",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await apiClient.chat({
                message: input,
                tenantSlug,
                conversationHistory: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
                config: {
                    responseStyle,
                    confidenceThreshold,
                    aiDisplayName,
                    language: "vi",
                },
            });

            const aiMessage: Message = {
                role: "assistant",
                content: response.response,
                confidence: response.confidence,
                tokenUsage: response.tokenUsage,
                processingTime: response.processingTime,
                chunks: response.retrievedChunks,
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Chat failed");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setMessages([]);
        toast.success("Chat cleared");
    };

    return (
        <div className="container py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Chat Playground</h1>
                <p className="text-muted-foreground">Test AI responses in real-time</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Chat Interface */}
                <div className="space-y-4">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle>Conversation</CardTitle>
                                <Button variant="outline" size="sm" onClick={handleClear}>
                                    🗑️ Clear
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center mt-8">
                                    No messages yet. Start a conversation!
                                </p>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === "visitor" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-4 ${msg.role === "visitor"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                                            {msg.role === "assistant" && (
                                                <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            Confidence: {((msg.confidence || 0) * 100).toFixed(0)}%
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            Tokens: {msg.tokenUsage}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {msg.processingTime}ms
                                                        </Badge>
                                                    </div>
                                                    {msg.chunks && msg.chunks.length > 0 && (
                                                        <details className="text-xs">
                                                            <summary className="cursor-pointer">
                                                                {msg.chunks.length} retrieved chunk(s)
                                                            </summary>
                                                            <div className="mt-2 space-y-1">
                                                                {msg.chunks.map((chunk, i) => (
                                                                    <div key={i} className="p-2 bg-background/50 rounded">
                                                                        <p className="font-medium">{chunk.documentTitle}</p>
                                                                        <p className="text-muted-foreground">
                                                                            Score: {(chunk.score * 100).toFixed(0)}%
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                        <div className="border-t p-4">
                            <div className="flex gap-2">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    rows={2}
                                    disabled={loading}
                                />
                                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                                    {loading ? "..." : "Send"}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Config Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Tenant Slug</label>
                                <Input
                                    value={tenantSlug}
                                    onChange={(e) => setTenantSlug(e.target.value)}
                                    placeholder="test-tenant"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">AI Display Name</label>
                                <Input
                                    value={aiDisplayName}
                                    onChange={(e) => setAiDisplayName(e.target.value)}
                                    placeholder="AI Assistant"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Response Style</label>
                                <Select value={responseStyle} onValueChange={setResponseStyle}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="friendly">Friendly</SelectItem>
                                        <SelectItem value="professional">Professional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Confidence Threshold: {confidenceThreshold}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={confidenceThreshold}
                                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    AI will escalate if below this threshold
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Messages:</span>
                                <span className="font-medium">{messages.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Tokens:</span>
                                <span className="font-medium">
                                    {messages.reduce((sum, m) => sum + (m.tokenUsage || 0), 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
