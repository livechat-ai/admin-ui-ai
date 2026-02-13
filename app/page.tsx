"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";

export default function DashboardPage() {
  const [health, setHealth] = useState<{
    status: string;
    qdrant: string;
    gemini: string;
    timestamp: string;
  } | null>(null);

  const [documents, setDocuments] = useState<{
    total: number;
    documents: Array<{
      id: string;
      title: string;
      category: string;
      status: string;
      chunkCount: number;
      createdAt: string;
    }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [healthData, docsData] = await Promise.all([
          apiClient.getHealth(),
          apiClient.getDocuments({}),
        ]);

        setHealth(healthData);
        setDocuments(docsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const indexedCount = documents?.documents.filter((d) => d.status === "indexed").length || 0;
  const totalChunks = documents?.documents.reduce((sum, d) => sum + d.chunkCount, 0) || 0;

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">System overview and health status</p>
      </div>

      {/* Health Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Qdrant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {health?.qdrant === "connected" ? "✅" : "❌"}
              </span>
              <Badge variant={health?.qdrant === "connected" ? "default" : "destructive"}>
                {health?.qdrant || "unknown"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gemini AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {health?.gemini === "available" ? "✅" : "❌"}
              </span>
              <Badge variant={health?.gemini === "available" ? "default" : "destructive"}>
                {health?.gemini || "unknown"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {health?.status === "ok" ? "✅" : "⚠️"}
              </span>
              <Badge variant={health?.status === "ok" ? "default" : "secondary"}>
                {health?.status || "unknown"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold">{documents?.total || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Indexed</p>
              <p className="text-2xl font-bold">{indexedCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Chunks</p>
              <p className="text-2xl font-bold">{totalChunks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents && documents.documents.length > 0 ? (
            <div className="space-y-3">
              {documents.documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.category} • {doc.chunkCount} chunks
                    </p>
                  </div>
                  <Badge variant={doc.status === "indexed" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents yet. Upload your first document in Knowledge Base.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
