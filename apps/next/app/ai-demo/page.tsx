'use client';

import { Message, Response } from '@/components/ai-elements/response';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <main className="container mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="font-semibold text-2xl">AI Elements Demo</h1>
      <div className="flex items-center gap-3">
        <Button type="button" variant="default">
          Primary Action
        </Button>
        <Button type="button" variant="secondary">
          Secondary
        </Button>
      </div>

      <section className="rounded-lg border p-4">
        <Response>
          <Message>Hello! Can you summarize this repo?</Message>
          <Message>
            This monorepo uses the GREEN stack with Turborepo, Tailwind v4, and
            shadcn UI components.
          </Message>
        </Response>
      </section>
    </main>
  );
}
