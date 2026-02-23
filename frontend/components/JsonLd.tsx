'use client';

/**
 * JsonLd component for injecting structured data (Schema.org) into the page.
 * Uses dangerouslySetInnerHTML to render the script tag required for SEO.
 */
export default function JsonLd({ data }: { data: any }) {
    if (!data) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
