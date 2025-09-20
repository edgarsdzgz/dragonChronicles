import { s as subscribe } from "../../chunks/utils.js";
import { g as getContext, c as create_ssr_component, e as escape } from "../../chunks/ssr.js";
import "../../chunks/logger.js";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const _error_svelte_svelte_type_style_lang = "";
const css = {
  code: ".error-container.svelte-afj2yc.svelte-afj2yc{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);color:#ffffff;padding:20px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif}.error-content.svelte-afj2yc.svelte-afj2yc{text-align:center;max-width:500px;width:100%}.error-icon.svelte-afj2yc.svelte-afj2yc{color:#ff6b6b;margin-bottom:24px}.error-title.svelte-afj2yc.svelte-afj2yc{font-size:2rem;font-weight:700;margin:0 0 16px 0;color:#ffffff}.error-message.svelte-afj2yc.svelte-afj2yc{font-size:1.1rem;color:#b0b0b0;margin:0 0 24px 0;line-height:1.6}.error-id.svelte-afj2yc.svelte-afj2yc{margin-bottom:32px;padding:12px;background:rgba(255, 255, 255, 0.05);border-radius:8px;border:1px solid rgba(255, 255, 255, 0.1)}.error-id.svelte-afj2yc code.svelte-afj2yc{background:rgba(255, 255, 255, 0.1);padding:4px 8px;border-radius:4px;font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace;font-size:0.9rem}.error-actions.svelte-afj2yc.svelte-afj2yc{display:flex;flex-direction:column;gap:12px;margin-bottom:32px}.btn.svelte-afj2yc.svelte-afj2yc{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;font-size:1rem;font-weight:500;cursor:pointer;transition:all 0.2s ease;border:none;text-decoration:none}.btn.svelte-afj2yc.svelte-afj2yc:disabled{opacity:0.6;cursor:not-allowed}.btn-primary.svelte-afj2yc.svelte-afj2yc{background:#4f46e5;color:white}.btn-primary.svelte-afj2yc.svelte-afj2yc:hover:not(:disabled){background:#4338ca;transform:translateY(-1px)}.btn-secondary.svelte-afj2yc.svelte-afj2yc{background:rgba(255, 255, 255, 0.1);color:white;border:1px solid rgba(255, 255, 255, 0.2)}.btn-secondary.svelte-afj2yc.svelte-afj2yc:hover:not(:disabled){background:rgba(255, 255, 255, 0.15);transform:translateY(-1px)}.btn-outline.svelte-afj2yc.svelte-afj2yc{background:transparent;color:#b0b0b0;border:1px solid rgba(255, 255, 255, 0.2)}.btn-outline.svelte-afj2yc.svelte-afj2yc:hover:not(:disabled){color:white;border-color:rgba(255, 255, 255, 0.4);transform:translateY(-1px)}.error-details.svelte-afj2yc.svelte-afj2yc{text-align:left;margin-top:32px;background:rgba(0, 0, 0, 0.3);border-radius:8px;border:1px solid rgba(255, 255, 255, 0.1)}.error-details.svelte-afj2yc summary.svelte-afj2yc{padding:16px;cursor:pointer;font-weight:500;border-bottom:1px solid rgba(255, 255, 255, 0.1)}.error-details.svelte-afj2yc summary.svelte-afj2yc:hover{background:rgba(255, 255, 255, 0.05)}.error-stack.svelte-afj2yc.svelte-afj2yc{padding:16px;margin:0;background:rgba(0, 0, 0, 0.5);border-radius:0 0 8px 8px;font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace;font-size:0.85rem;line-height:1.4;color:#e0e0e0;overflow-x:auto;white-space:pre-wrap;word-break:break-word}@media(min-width: 640px){.error-actions.svelte-afj2yc.svelte-afj2yc{flex-direction:row;justify-content:center}.btn.svelte-afj2yc.svelte-afj2yc{min-width:140px}}@media(max-width: 480px){.error-title.svelte-afj2yc.svelte-afj2yc{font-size:1.5rem}.error-message.svelte-afj2yc.svelte-afj2yc{font-size:1rem}.error-content.svelte-afj2yc.svelte-afj2yc{padding:0 16px}}",
  map: null
};
const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let errorId;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css);
  $page.error;
  errorId = $page.error?.id || "unknown";
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-16ie6ml_START -->${$$result.title = `<title>Error - Draconia Chronicles</title>`, ""}<!-- HEAD_svelte-16ie6ml_END -->`, ""} <div class="error-container svelte-afj2yc"><div class="error-content svelte-afj2yc"> <div class="error-icon svelte-afj2yc" data-svelte-h="svelte-1me7wbz"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>  <h1 class="error-title svelte-afj2yc" data-svelte-h="svelte-vc6ed9">Something went wrong</h1> <p class="error-message svelte-afj2yc" data-svelte-h="svelte-1ep0nnb">We encountered an unexpected error. Don&#39;t worry, your progress is safe.</p>  ${errorId !== "unknown" ? `<div class="error-id svelte-afj2yc"><small>Error ID: <code class="svelte-afj2yc">${escape(errorId)}</code></small></div>` : ``}  <div class="error-actions svelte-afj2yc"><button class="btn btn-primary svelte-afj2yc" data-svelte-h="svelte-9i4x98"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"></polyline><polyline points="1,20 1,14 7,14"></polyline><path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path></svg>
        Reload Page</button> <button class="btn btn-secondary svelte-afj2yc" data-svelte-h="svelte-1bwg4be"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3,9L12,2L21,9V20A2,2,0,0,1,19,22H5A2,2,0,0,1,3,20Z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>
        Go Home</button> <button class="btn btn-outline svelte-afj2yc" ${""}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21,15V19A2,2,0,0,1,19,21H5A2,2,0,0,1,3,19V15"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> ${escape("Download Logs")}</button></div>  ${``}</div> </div>`;
});
export {
  Error$1 as default
};
