"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function KnowledgePage() {
    const [documents, setDocuments] = useState<Array<{
        id: string;
        title: string;
        category: string;
        status: string;
        chunkCount: number;
        createdAt: string;
        indexedAt?: string;
        errorMessage?: string;
    }>>([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Upload form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("general");
    const [tenantSlug, setTenantSlug] = useState("test-tenant");
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const fetchDocuments = async () => {
        try {
            const data = await apiClient.getDocuments({});
            setDocuments(data.documents);
        } catch (error) {
            toast.error("Failed to load documents");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!content.trim() && !file) {
            toast.error("Please provide content or upload a file");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("category", category);
            formData.append("tenantSlug", tenantSlug);

            if (content.trim()) {
                formData.append("content", content);
            }

            if (file) {
                formData.append("file", file);
            }

            const result = await apiClient.uploadDocument(formData);
            toast.success(`Document uploaded: ${result.message}`);

            // Reset form
            setTitle("");
            setCategory("general");
            setContent("");
            setFile(null);

            // Reload documents
            await fetchDocuments();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;

        try {
            await apiClient.deleteDocument(id);
            toast.success("Document deleted");
            await fetchDocuments();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleReindex = async (id: string, title: string) => {
        try {
            await apiClient.reindexDocument(id);
            toast.success(`Reindexing "${title}"...`);
            await fetchDocuments();
        } catch (error) {
            toast.error("Reindex failed");
        }
    };

    return (
        <div className="container py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Knowledge Base</h1>
                <p className="text-muted-foreground">Manage documents and knowledge sources</p>
            </div>

            {/* Upload Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-sm font-medium">Title *</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Document title"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Category</label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="general, pricing, support..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Tenant Slug</label>
                            <Input
                                value={tenantSlug}
                                onChange={(e) => setTenantSlug(e.target.value)}
                                placeholder="test-tenant"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Content (text)</label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your document content here..."
                            rows={6}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Or upload file (.pdf, .docx, .txt)</label>
                        <Input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <Button onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload Document"}
                    </Button>
                </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Documents ({documents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : documents.length === 0 ? (
                        <Alert>
                            <AlertDescription>
                                No documents yet. Upload your first document above.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Chunks</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.title}</TableCell>
                                        <TableCell>{doc.category}</TableCell>
                                        <TableCell>
                                            <Badge variant={doc.status === "indexed" ? "default" : "secondary"}>
                                                {doc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{doc.chunkCount}</TableCell>
                                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReindex(doc.id, doc.title)}
                                            >
                                                🔄 Reindex
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(doc.id, doc.title)}
                                            >
                                                🗑️ Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
