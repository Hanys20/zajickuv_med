import assert from 'node:assert/strict';
import {test} from 'node:test';
import {forwardIncoming} from './email-forward.ts';
const recipients=['first@example.com','second@example.com'];
test('forwards independently to both destinations; pending verification does not block the verified address',async()=>{
  const called=[];
  await forwardIncoming({to:'info@zajickuv-med.cz',async forward(address){called.push(address);if(address===recipients[1])throw new Error('Not verified');}},
    {FORWARD_TO_EMAILS:JSON.stringify(recipients)});
  assert.deepEqual(called,recipients);
});
test('forwards to both once verification is complete',async()=>{
  const called=[];
  await forwardIncoming({to:'info@zajickuv-med.cz',async forward(address){called.push(address);}},
    {FORWARD_TO_EMAILS:JSON.stringify(recipients)});
  assert.deepEqual(called,recipients);
});
test('rejects other aliases and invalid configuration without forwarding',async()=>{
  let rejected=false;
  await forwardIncoming({to:'other@zajickuv-med.cz',setReject(){rejected=true;},forward(){assert.fail();}},{});
  assert.equal(rejected,true);
  await assert.rejects(()=>forwardIncoming({to:'info@zajickuv-med.cz',forward(){assert.fail();}},{FORWARD_TO_EMAILS:'bad'}));
});
test('does not silently accept when all forwards failed',async()=>{
  await assert.rejects(()=>forwardIncoming({to:'info@zajickuv-med.cz',async forward(){throw new Error('Provider failure');}},
    {FORWARD_TO_EMAILS:JSON.stringify(recipients)}),/All email forwards failed/);
});
