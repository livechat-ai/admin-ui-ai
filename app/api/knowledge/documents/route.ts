import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3310';
const API_KEY = process.env.API_KEY || '';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = new URLSearchParams();

        // Forward query parameters
        searchParams.forEach((value, key) => {
            query.append(key, value);
        });

        const response = await fetch(`${BACKEND_URL}/knowledge/documents?${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `Backend error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const response = await fetch(`${BACKEND_URL}/knowledge/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `Backend error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
