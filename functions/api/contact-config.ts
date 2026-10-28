import { handleContactConfig } from '../../worker/contact';
import type { ContactEnv } from '../../worker/contact';

export const onRequest: PagesFunction<ContactEnv> = ({ request, env }) => handleContactConfig(request, env);
