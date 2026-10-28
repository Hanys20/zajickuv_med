import { handleContact } from '../../worker/contact';
import type { ContactEnv } from '../../worker/contact';

export const onRequest: PagesFunction<ContactEnv> = (ctx) => handleContact(ctx.request, ctx.env, ctx);
