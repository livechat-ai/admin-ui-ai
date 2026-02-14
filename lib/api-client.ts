/**
 * API Client for KLive-AI Backend
 * Wraps fetch with API key authentication + base URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

class ApiClient {
    private baseURL: string;
    private apiKey: string;

    constructor() {
        this.baseURL = API_URL;
        this.apiKey = API_KEY;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error (${response.status}): ${error}`);
        }

        return response.json();
    }

    // Health Check
    async getHealth() {
        return this.request<{
            status: string;
            qdrant: string;
            gemini: string;
            timestamp: string;
        }>('/health');
    }

    // Knowledge Base APIs
    async getDocuments(params?: { tenantSlug?: string; status?: string; category?: string }) {
        const query = new URLSearchParams(params as Record<string, string>);
        return this.request<{
            documents: Array<{
                id: string;
                title: string;
                category: string;
                status: string;
                chunkCount: number;
                createdAt: string;
                indexedAt?: string;
                errorMessage?: string;
            }>;
            total: number;
        }>(`/knowledge/documents?${query}`);
    }

    async getDocument(id: string) {
        return this.request<{
            id: string;
            title: string;
            category: string;
            status: string;
            chunkCount: number;
            createdAt: string;
            indexedAt?: string;
            errorMessage?: string;
            metadata?: Record<string, unknown>;
            fileType: string;
        }>(`/knowledge/documents/${id}`);
    }

    async uploadDocument(formData: FormData) {
        const url = `${this.baseURL}/knowledge/documents`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Upload failed (${response.status}): ${error}`);
        }

        return response.json() as Promise<{
            documentId: string;
            status: string;
            message: string;
        }>;
    }

    async deleteDocument(id: string) {
        return this.request<{ success: boolean; message: string }>(
            `/knowledge/documents/${id}`,
            { method: 'DELETE' }
        );
    }

    async reindexDocument(id: string) {
        return this.request<{ success: boolean; message: string }>(
            `/knowledge/reindex/${id}`,
            { method: 'POST' }
        );
    }

    async search(params: { query: string; tenantSlug: string; category?: string; topK?: number }) {
        return this.request<{
            chunks: Array<{
                id: string;
                score: number;
                content: string;
                metadata: Record<string, unknown>;
            }>;
            maxScore: number;
            total: number;
        }>('/knowledge/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
    }

    // Chat API
    async chat(params: {
        message: string;
        tenantSlug: string;
        conversationHistory?: Array<{ role: 'visitor' | 'assistant'; content: string }>;
        config?: {
            responseStyle?: string;
            maxResponseLength?: number;
            language?: string;
            confidenceThreshold?: number;
            enabledCategories?: string[];
            aiDisplayName?: string;
        };
    }) {
        return this.request<{
            response: string;
            confidence: number;
            intent: string;
            shouldEscalate: boolean;
            escalationReason?: string;
            retrievedChunks: Array<{
                chunkId: string;
                score: number;
                content: string;
                documentTitle: string;
            }>;
            tokenUsage: number;
            processingTime: number;
        }>('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
    }
}

export const apiClient = new ApiClient();
