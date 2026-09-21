// A static site can prepare a draft without pretending it delivered a message.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-form-status');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = String(data.get('subject') || '').trim();
    const body = `${data.get('message')}\n\nFrom: ${data.get('name')}\nReply to: ${data.get('email')}`;
    const draftUrl = `${form.action}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your email draft is ready. Review and send it in your email app. If no app opens, use the email link below; your message is still here.';
    window.location.href = draftUrl;
  });
});
