import {runtime} from './inquiry-server';
import {sendInquiryEmail} from './inquiry-email.mjs';
export async function notifyInquiry(id:string,origin:string){
  const {DB,EMAIL_NOTIFICATIONS_ENABLED}=runtime();
  if(EMAIL_NOTIFICATIONS_ENABLED!=='true')return 'pending';
  const stale=new Date(Date.now()-60000).toISOString();
  const claimed=await DB.prepare("UPDATE inquiries SET email_status = 'sending', email_attempted_at = ? WHERE id = ? AND (email_status IN ('pending','failed') OR (email_status = 'sending' AND email_attempted_at < ?)) RETURNING *").bind(new Date().toISOString(),id,stale).first();
  if(!claimed){const row=await DB.prepare('SELECT email_status FROM inquiries WHERE id = ?').bind(id).first<{email_status:string}>();return row?.email_status||'pending';}
  try{await sendInquiryEmail(claimed,origin);await DB.prepare("UPDATE inquiries SET email_status = 'accepted' WHERE id = ?").bind(id).run();return 'accepted';}
  catch(error){const reason=error instanceof Error?error.message:'unknown';console.error('Inquiry email notification failed',/^(email-provider-|The operation was aborted|The operation timed out)/.test(reason)?reason:(error instanceof Error?error.name:'unknown'));await DB.prepare("UPDATE inquiries SET email_status = 'failed' WHERE id = ?").bind(id).run();return 'failed';}
}
