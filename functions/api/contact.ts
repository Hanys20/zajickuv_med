import { handleContact } from '../../worker/contact';
import type { ContactEnv } from '../../worker/contact';

export const onRequest: PagesFunction<ContactEnv> = ({ request, env }) => handleContact(request, env);
