/**
 * form.js — AgriFértil BEAUVE100®
 * Validação, máscara, UTMs, Meta Pixel, CAPI, API de leads.
 */

// ============================================================
// CONFIGURAÇÃO CENTRAL — edite aqui
// ============================================================
const CONFIG = {
  leadApiEndpoint: "https://hook.us2.make.com/m0yvkmbmnycoi3gm5ybr4spk5k8k3rks",
  capiEndpoint: "/wp-json/meta-capi/v1/event",  // Endpoint CAPI no WordPress
  metaPixelId: "2912212712376628",              // ID do Meta Pixel
  pageId: "solofertil-cafe",                     // Identifica a origem do lead entre as páginas
  demoMode: false                               // false = produção
};

// ============================================================
// UTILITÁRIOS
// ============================================================
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getUTMs() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source:   params.get("utm_source")   || "",
    utm_medium:   params.get("utm_medium")   || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content:  params.get("utm_content")  || "",
    utm_term:     params.get("utm_term")     || ""
  };
}

function sanitize(str) {
  return String(str || "").trim().replace(/<[^>]*>/g, "");
}

function getDDD() {
  return document.getElementById("ddd")?.value || "";
}

// Máscara do número local (sem DDD): 9 dígitos → 00000-0000, 8 → 0000-0000.
function phoneMask(value) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 8) {
    return digits.replace(/(\d{4})(\d{0,4})/, "$1-$2").replace(/-$/, "");
  }
  return digits.replace(/(\d{5})(\d{0,4})/, "$1-$2").replace(/-$/, "");
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  // Número local: 8 (fixo) ou 9 (celular) dígitos.
  return digits.length === 8 || digits.length === 9;
}

// ============================================================
// MÁSCARA DE WHATSAPP
// ============================================================
(function initPhoneMask() {
  const input = document.getElementById("whatsapp");
  if (!input) return;
  input.addEventListener("input", (e) => {
    e.target.value = phoneMask(e.target.value);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.selectionStart === input.selectionEnd) {
      const pos = input.selectionStart;
      const val = input.value;
      if (pos > 0 && /\D/.test(val[pos - 1])) {
        e.preventDefault();
        const newVal = val.slice(0, pos - 2) + val.slice(pos);
        input.value = phoneMask(newVal);
        const newPos = pos - 2;
        input.setSelectionRange(newPos, newPos);
      }
    }
  });
})();

// ============================================================
// META PIXEL
// ============================================================
function initMetaPixel() {
  if (!CONFIG.metaPixelId) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq("init", CONFIG.metaPixelId);
  window.fbq("track", "PageView");
  window.fbq("track", "ViewContent");
}

function firePixelLead(eventId) {
  if (!CONFIG.metaPixelId || typeof window.fbq !== "function") return;
  window.fbq("track", "Lead", {}, { eventID: eventId });
}

// ============================================================
// CAPI (via PHP/WordPress)
// ============================================================
async function sendCAPI(eventName, eventId, userData) {
  if (!CONFIG.capiEndpoint) return;
  if (CONFIG.demoMode) {
    console.log("[DEMO] CAPI:", { eventName, eventId, userData });
    return;
  }
  try {
    await fetch(CONFIG.capiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: eventName, event_id: eventId, user_data: userData })
    });
  } catch (_) {
    // erro silencioso — não expõe detalhes ao usuário
  }
}

// ============================================================
// API DE LEADS
// ============================================================
async function sendLeadAPI(payload) {
  if (!CONFIG.leadApiEndpoint) return;
  if (CONFIG.demoMode) {
    console.log("[DEMO] Lead API:", payload);
    return;
  }
  try {
    await fetch(CONFIG.leadApiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (_) {
    // erro silencioso
  }
}

// ============================================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================================
function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "-error");
  if (input) input.classList.add("error");
  if (errorEl) errorEl.textContent = message;
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "-error");
  if (input) input.classList.remove("error");
  if (errorEl) errorEl.textContent = "";
}

function validateForm(data) {
  let valid = true;

  if (!data.nome || data.nome.length < 3) {
    showError("nome", "Informe seu nome completo.");
    valid = false;
  } else {
    clearError("nome");
  }

  if (!data.ddd) {
    document.getElementById("ddd")?.classList.add("error");
    showError("whatsapp", "Selecione o DDD e informe o número.");
    valid = false;
  } else if (!isValidPhone(data.whatsapp)) {
    document.getElementById("ddd")?.classList.remove("error");
    showError("whatsapp", "Informe o número com 8 ou 9 dígitos.");
    valid = false;
  } else {
    document.getElementById("ddd")?.classList.remove("error");
    clearError("whatsapp");
  }

  if (!data.lgpd) {
    showError("lgpd", "Você precisa aceitar para continuar.");
    valid = false;
  } else {
    clearError("lgpd");
  }

  return valid;
}

// ============================================================
// ENVIO DO FORMULÁRIO
// ============================================================
(function initForm() {
  const form   = document.getElementById("lead-form");
  const submit = document.getElementById("form-submit");
  if (!form || !submit) return;

  initMetaPixel();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot
    const hp = form.querySelector(".form-hp input");
    if (hp && hp.value !== "") return;

    const nome     = sanitize(document.getElementById("nome")?.value);
    const whatsapp = sanitize(document.getElementById("whatsapp")?.value);
    const ddd      = getDDD();
    const lgpd     = document.getElementById("lgpd")?.checked;

    const data = { nome, whatsapp, ddd, lgpd };
    if (!validateForm(data)) return;

    // Bloqueia duplo envio
    submit.disabled = true;
    submit.classList.add("loading");

    const eventId = generateUUID();
    const utms    = getUTMs();

    const numberDigits = whatsapp.replace(/\D/g, "");      // número local (8-9 dígitos)
    const dddDigits    = ddd.replace(/\D/g, "");           // DDD (2 dígitos)
    const nationalPhone = dddDigits + numberDigits;        // DDD + número (10-11 dígitos)
    const fullPhone     = "55" + nationalPhone;            // E.164 sem o "+"

    const payload = {
      event_id: eventId,
      page_id: CONFIG.pageId,
      nome,
      ddd: dddDigits,
      whatsapp: nationalPhone,
      whatsapp_full: fullPhone,
      ...utms,
      timestamp: new Date().toISOString(),
      page_url: window.location.href
    };

    // Disparo em paralelo
    await Promise.allSettled([
      sendLeadAPI(payload),
      sendCAPI("Lead", eventId, { phone: fullPhone }),
      Promise.resolve(firePixelLead(eventId))
    ]);

    if (CONFIG.demoMode) {
      console.log("[DEMO] Envio completo. Redirecionando para obrigado.html");
    }

    // Salva event_id para disparar CompleteRegistration na próxima página
    sessionStorage.setItem("af_event_id", eventId);

    window.location.href = "obrigado.html";
  });

  // Limpa erros ao digitar
  form.querySelectorAll(".form-input, .form-select").forEach((input) => {
    input.addEventListener("input", () => clearError(input.id));
    input.addEventListener("change", () => clearError(input.id));
  });
})();
