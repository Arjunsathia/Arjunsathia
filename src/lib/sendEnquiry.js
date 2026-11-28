import {enquiryMail, profile} from '../content/site.js';

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

export const enquiryMailReady = () => Boolean(enquiryMail.serviceId && enquiryMail.templateId && enquiryMail.publicKey);

const escapeHtml = text => text.replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));

// The fields the email template uses. `message_html` is the message escaped, with its line breaks kept, for the
// template's {{{message_html}}} slot (email apps drop CSS white-space, so new lines become <br>).
function enquiryParams({name, email, topic, message}) {
  const sentAt = new Date().toLocaleString('en-GB', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'}) + ' IST';
  return {
    from_name: name,
    from_email: email,
    reply_to: email,
    topic,
    message,
    message_html: escapeHtml(message).replace(/\r?\n/g, '<br>'),
    sent_at: sentAt,
    page_url: window.location.origin + window.location.pathname,
  };
}

// A mailto: link with the enquiry filled in, used when EmailJS isn't set up or a send fails.
export function enquiryMailto({name, email, topic, message}) {
  const subject = `${topic} from ${name}`;
  const body = `${message}\n\n— ${name}\n${email}`;
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function sendEnquiry(fields) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      service_id: enquiryMail.serviceId,
      template_id: enquiryMail.templateId,
      user_id: enquiryMail.publicKey,
      template_params: enquiryParams(fields),
    }),
  });
  if (!response.ok) throw new Error(`EmailJS ${response.status}: ${await response.text().catch(() => '')}`);
}
