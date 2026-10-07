import { currentLanguage } from '../i18n/client';

// A browser cannot reliably detect which WhatsApp edition is installed.
// Keep the chat details available when an in-app browser blocks app handoff.
export function openWhatsApp(href: string) {
  const url = new URL(href);
  if (!['wa.me', 'api.whatsapp.com'].includes(url.hostname)) return;
  const phone = url.hostname === 'wa.me' ? url.pathname.slice(1).replace(/\/$/, '') : url.searchParams.get('phone') ?? '';
  if (!/^\d+$/.test(phone)) { window.location.assign(href); return; }
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.assign(href);
    return;
  }
  document.getElementById('whatsapp-handoff')?.remove();
  const english = currentLanguage() === 'en';
  const t = (id: string, en: string) => english ? en : id;
  const message = url.searchParams.get('text') ?? '';
  const dialog = document.createElement('dialog');
  dialog.id = 'whatsapp-handoff';
  dialog.setAttribute('aria-labelledby', 'whatsapp-handoff-title');
  dialog.setAttribute('data-no-translate', '');
  dialog.style.cssText = 'margin:auto;width:min(92vw,460px);max-height:88dvh;overflow:auto;padding:24px;border:1px solid #b79b62;border-radius:12px;background:#191916;color:#f4f0e7;box-shadow:0 0 0 100vmax #0009';
  const heading = document.createElement('h2');
  heading.id = 'whatsapp-handoff-title';
  heading.textContent = t('Lanjutkan chat WhatsApp', 'Continue to WhatsApp');
  heading.style.cssText = 'font-family:var(--font-display,serif);font-size:30px;line-height:1.2;margin-bottom:16px';
  const help = document.createElement('p');
  help.textContent = t('Jika diminta menginstal WhatsApp padahal sudah ada, buka tautan lewat Chrome atau menu browser “Buka di browser eksternal”. Kamu juga bisa menyalin nomor dan pesan ke WhatsApp biasa maupun Business.', 'If asked to install WhatsApp despite having it, open the link in Chrome or use the browser menu “Open in external browser”. You can also copy the number and message into WhatsApp or WhatsApp Business.');
  help.style.cssText = 'font-size:13px;line-height:1.7;color:#c7c3ba;margin-bottom:18px';
  const actions = document.createElement('div');
  actions.style.cssText = 'display:grid;gap:10px';
  const actionStyle = 'display:block;min-height:44px;padding:12px;border:1px solid #b79b6266;border-radius:6px;text-align:center;font-size:14px;cursor:pointer';
  const proceed = document.createElement('a');
  proceed.href = href;
  proceed.dataset.whatsappDirect = 'true';
  proceed.textContent = t('Buka WhatsApp', 'Open WhatsApp');
  proceed.style.cssText = actionStyle + ';background:#b79b62;color:#11110f';
  actions.append(proceed);
  if (/Android/i.test(navigator.userAgent)) {
    const chrome = document.createElement('a');
    chrome.href = `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
    chrome.textContent = t('Buka lewat Chrome', 'Open in Chrome');
    chrome.style.cssText = actionStyle;
    actions.append(chrome);
  }
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.style.cssText = 'font-size:13px;line-height:1.6;margin-top:12px';
  const addCopy = (label: string, value: string, multiline = false) => {
    const field = document.createElement('textarea');
    field.readOnly = true;
    field.value = value;
    field.rows = multiline ? 4 : 1;
    field.setAttribute('aria-label', label);
    field.style.cssText = 'width:100%;padding:10px;background:#11110f;color:#f4f0e7;border:1px solid #ffffff25;border-radius:6px;font-size:13px';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = actionStyle;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(value);
        status.textContent = t('Disalin. Buka aplikasi WhatsApp kamu lalu tempel.', 'Copied. Open your WhatsApp app and paste.');
      } catch {
        field.focus(); field.select(); field.setSelectionRange(0, value.length);
        status.textContent = t('Tekan lama teks yang dipilih lalu pilih Salin.', 'Press and hold the selected text, then choose Copy.');
      }
    });
    actions.append(field, button);
  };
  addCopy(t('Salin nomor tujuan', 'Copy recipient number'), `+${phone}`);
  if (message) addCopy(t('Salin pesan', 'Copy message'), message, true);
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = t('Kembali', 'Back');
  close.style.cssText = actionStyle + ';margin-top:14px;width:100%';
  close.addEventListener('click', () => dialog.close());
  dialog.append(heading, help, actions, status, close);
  const previousFocus = document.activeElement as HTMLElement | null;
  dialog.addEventListener('close', () => { dialog.remove(); previousFocus?.focus(); });
  document.body.append(dialog);
  dialog.showModal();
}

export function initializeWhatsAppLinks() {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!anchor || anchor.dataset.whatsappDirect) return;
    const url = new URL(anchor.href);
    if (!['wa.me', 'api.whatsapp.com'].includes(url.hostname)) return;
    event.preventDefault();
    openWhatsApp(anchor.href);
  });
}
