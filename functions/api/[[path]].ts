// Keep the existing admin, availability, pricing and reviews API when using Pages.
import worker from '../../worker/worker';
import type { Env } from '../../worker/worker';

export const onRequest: PagesFunction<Env> = (ctx) => worker.fetch(ctx.request, ctx.env, ctx);
