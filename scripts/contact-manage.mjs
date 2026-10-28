// Node 22.18+. No public administration route; credentials stay in the local process.
import { cleanupContact, sendStoredMessage, refreshMessageDelivery } from '../worker/contact.ts';

const [command, id, ...flags] = process.argv.slice(2);
const env = process.env;
const accountId = env.CF_ACCOUNT_ID;
const databaseId = env.CONTACT_DATABASE_ID;
const token = env.CF_CONTACT_ADMIN_TOKEN;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function query(sql, params = []) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ sql, params }), signal: AbortSignal.timeout(30000), redirect: 'manual',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true || data.result?.[0]?.success !== true) {
    throw new Error(`D1 požadavek selhal (HTTP ${response.status}). Ověřte oprávnění a ID databáze.`);
  }
  return data.result[0];
}

const db = {
  prepare(sql) {
    let params = [];
    return {
      bind(...values) { params = values; return this; },
      async first() { return (await query(sql, params)).results?.[0] ?? null; },
      async run() { return query(sql, params); },
    };
  },
  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  },
};

async function main() {
  if (!['list', 'show', 'retry', 'resolve', 'cleanup'].includes(command)) {
    console.log('Použití: node scripts/contact-manage.mjs list | show ID | retry ID --send | resolve ID --recipient=adresa --confirmed-not-accepted/--confirmed-delivered | cleanup');
    return;
  }
  if (!/^[a-f0-9]{32}$/i.test(accountId ?? '') || !/^[a-f0-9-]{36}$/i.test(databaseId ?? '') || !token) {
    throw new Error('Nastavte CF_ACCOUNT_ID, CONTACT_DATABASE_ID a CF_CONTACT_ADMIN_TOKEN (D1:Edit).');
  }
  if (['show', 'retry', 'resolve'].includes(command) && !uuid.test(id ?? '')) throw new Error('Neplatné ID zprávy.');
  if (command === 'list') {
    // No names, email addresses or message bodies in the overview.
    const result = await query(`SELECT id, datetime(created_at, 'unixepoch') AS received_utc,
      delivery_status, attempts, last_error, provider_message_id FROM contact_messages
      ORDER BY created_at DESC LIMIT 100`);
    console.table(result.results);
  } else if (command === 'show') {
    const row = await db.prepare('SELECT * FROM contact_messages WHERE id = ?').bind(id).first();
    if (!row) throw new Error('Zpráva neexistuje.');
    console.log(JSON.stringify(row, null, 2));
    console.table((await query('SELECT * FROM contact_deliveries WHERE message_id=?',[id])).results);
  } else if (command === 'retry') {
    if (flags.length !== 1 || flags[0] !== '--send') throw new Error('Opětovné odeslání vyžaduje retry ID --send.');
    console.log(await sendStoredMessage(db, env, id));
  } else if (command === 'resolve') {
    const recipientFlag=flags.find(f=>f.startsWith('--recipient='));
    const resolution=flags.filter(f=>f!==recipientFlag);
    if (resolution.length !== 1 || !['--confirmed-not-accepted', '--confirmed-delivered'].includes(resolution[0])) {
      throw new Error('Nejdříve ověřte výsledek. Použijte --recipient=adresa a --confirmed-not-accepted nebo --confirmed-delivered.');
    }
    const status = resolution[0] === '--confirmed-delivered' ? 'sent' : 'pending';
    const hasDeliveries=await db.prepare('SELECT recipient FROM contact_deliveries WHERE message_id=? LIMIT 1').bind(id).first();
    if(hasDeliveries&&!recipientFlag)throw new Error('Vyberte konkrétního příjemce pomocí --recipient=adresa.');
    const result=hasDeliveries?await query(`UPDATE contact_deliveries SET delivery_status=?,last_error='operator_verified'
      WHERE message_id=? AND recipient=? AND delivery_status IN ('uncertain','sending','queued') AND attempted_at<=?`,
      [status,id,recipientFlag.slice('--recipient='.length).toLowerCase(),Math.floor(Date.now()/1000)-900]):await query(`UPDATE contact_messages SET delivery_status = ?, last_error = 'operator_verified'
      WHERE id = ? AND delivery_status IN ('uncertain', 'sending', 'queued') AND attempted_at <= ?`,
    [status, id, Math.floor(Date.now() / 1000) - 900]);
    if(hasDeliveries)await refreshMessageDelivery(db,id);
    console.log(`Aktualizováno: ${result.meta?.changes ?? 0}. Odesílání se tímto příkazem nespouští.`);
  } else {
    await cleanupContact(db);
    console.log('Odstraněny zprávy starší 90 dnů a identifikátory pokusů starší 15 minut.');
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
