// Pages has no Cron Trigger. This optional private maintenance Worker only deletes expired records.
import { cleanupContact } from './contact';
import type { ContactEnv } from './contact';

export default {
  async scheduled(_event: ScheduledController, env: ContactEnv): Promise<void> {
    if (!env.CONTACT_DB) throw new Error('Missing CONTACT_DB');
    await cleanupContact(env.CONTACT_DB);
  },
  async fetch(): Promise<Response> { return new Response('Not found', { status: 404 }); },
};
