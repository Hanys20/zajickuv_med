// Keep the existing admin, availability, pricing and reviews API when using Pages.
import worker from '../../worker/worker';
import type { Env } from '../../worker/worker';

export const onRequest: PagesFunction<Env> = ({ request, env }) => worker.fetch(request, env);
