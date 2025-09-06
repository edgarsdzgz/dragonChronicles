import { s as subscribe } from "../../chunks/utils.js";
import { c as create_ssr_component, o as onDestroy, a as add_attribute, v as validate_component } from "../../chunks/ssr.js";
import "../../chunks/index.js";
import { a as appFlags, h as hudEnabled } from "../../chunks/store.js";
performance.now();
const UpdateToast_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ".update-toast.svelte-1xi6sk9.svelte-1xi6sk9{position:fixed;top:20px;right:20px;z-index:1000;max-width:400px;background:rgba(26, 26, 26, 0.95);backdrop-filter:blur(10px);border:1px solid rgba(74, 144, 226, 0.3);border-radius:12px;box-shadow:0 8px 32px rgba(0, 0, 0, 0.3);animation:svelte-1xi6sk9-slideIn 0.3s ease-out}.update-toast--installing.svelte-1xi6sk9.svelte-1xi6sk9{border-color:rgba(255, 107, 107, 0.3)}.update-toast__content.svelte-1xi6sk9.svelte-1xi6sk9{display:flex;align-items:flex-start;gap:12px;padding:16px}.update-toast__icon.svelte-1xi6sk9.svelte-1xi6sk9{flex-shrink:0;width:24px;height:24px;color:#4a90e2;display:flex;align-items:center;justify-content:center}.update-toast--installing.svelte-1xi6sk9 .update-toast__icon.svelte-1xi6sk9{color:#ff6b6b}.update-toast__spinner.svelte-1xi6sk9.svelte-1xi6sk9{width:20px;height:20px;border:2px solid rgba(255, 107, 107, 0.3);border-top:2px solid #ff6b6b;border-radius:50%;animation:svelte-1xi6sk9-spin 1s linear infinite}.update-toast__text.svelte-1xi6sk9.svelte-1xi6sk9{flex:1;min-width:0}.update-toast__title.svelte-1xi6sk9.svelte-1xi6sk9{font-size:14px;font-weight:600;color:#ffffff;margin-bottom:4px}.update-toast__message.svelte-1xi6sk9.svelte-1xi6sk9{font-size:13px;color:#cccccc;line-height:1.4}.update-toast__actions.svelte-1xi6sk9.svelte-1xi6sk9{display:flex;gap:8px;margin-top:12px}.update-toast__button.svelte-1xi6sk9.svelte-1xi6sk9{padding:8px 16px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s ease}.update-toast__button--primary.svelte-1xi6sk9.svelte-1xi6sk9{background:#4a90e2;color:#ffffff}.update-toast__button--primary.svelte-1xi6sk9.svelte-1xi6sk9:hover{background:#3a7bc8}.update-toast__button--secondary.svelte-1xi6sk9.svelte-1xi6sk9{background:rgba(255, 255, 255, 0.1);color:#cccccc}.update-toast__button--secondary.svelte-1xi6sk9.svelte-1xi6sk9:hover{background:rgba(255, 255, 255, 0.2)}@keyframes svelte-1xi6sk9-slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes svelte-1xi6sk9-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@media(max-width: 480px){.update-toast.svelte-1xi6sk9.svelte-1xi6sk9{top:10px;right:10px;left:10px;max-width:none}.update-toast__actions.svelte-1xi6sk9.svelte-1xi6sk9{flex-direction:column}.update-toast__button.svelte-1xi6sk9.svelte-1xi6sk9{width:100%}}",
  map: null
};
const UpdateToast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  onDestroy(() => {
  });
  $$result.css.add(css$2);
  return `${``} ${``}`;
});
const InstallPrompt_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".install-prompt.svelte-16t91j5{position:fixed;bottom:20px;left:20px;right:20px;z-index:1000;max-width:400px;margin:0 auto;background:rgba(26, 26, 26, 0.95);backdrop-filter:blur(10px);border:1px solid rgba(74, 144, 226, 0.3);border-radius:12px;box-shadow:0 8px 32px rgba(0, 0, 0, 0.3);animation:svelte-16t91j5-slideUp 0.3s ease-out}.install-prompt__content.svelte-16t91j5{display:flex;align-items:flex-start;gap:12px;padding:16px}.install-prompt__icon.svelte-16t91j5{flex-shrink:0;width:24px;height:24px;color:#4a90e2;display:flex;align-items:center;justify-content:center}.install-prompt__text.svelte-16t91j5{flex:1;min-width:0}.install-prompt__title.svelte-16t91j5{font-size:14px;font-weight:600;color:#ffffff;margin-bottom:4px}.install-prompt__message.svelte-16t91j5{font-size:13px;color:#cccccc;line-height:1.4}.install-prompt__actions.svelte-16t91j5{display:flex;gap:8px;margin-top:12px}.install-prompt__button.svelte-16t91j5{padding:8px 16px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s ease}.install-prompt__button--primary.svelte-16t91j5{background:#4a90e2;color:#ffffff}.install-prompt__button--primary.svelte-16t91j5:hover{background:#3a7bc8}.install-prompt__button--secondary.svelte-16t91j5{background:rgba(255, 255, 255, 0.1);color:#cccccc}.install-prompt__button--secondary.svelte-16t91j5:hover{background:rgba(255, 255, 255, 0.2)}@keyframes svelte-16t91j5-slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}@media(max-width: 480px){.install-prompt.svelte-16t91j5{bottom:10px;left:10px;right:10px}.install-prompt__actions.svelte-16t91j5{flex-direction:column}.install-prompt__button.svelte-16t91j5{width:100%}}",
  map: null
};
const InstallPrompt = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let showInstallPrompt = false;
  let isInstalled = false;
  onDestroy(() => {
    if (typeof window === "undefined")
      return;
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.removeEventListener("appinstalled", handleAppInstalled);
  });
  function handleBeforeInstallPrompt(event) {
    event.preventDefault();
    showInstallPrompt = true;
  }
  function handleAppInstalled() {
    console.log("PWA was installed");
    isInstalled = true;
    showInstallPrompt = false;
  }
  $$result.css.add(css$1);
  return `${showInstallPrompt && !isInstalled ? `<div class="install-prompt svelte-16t91j5" role="dialog" aria-labelledby="install-title" aria-describedby="install-description"><div class="install-prompt__content svelte-16t91j5"><div class="install-prompt__icon svelte-16t91j5" data-svelte-h="svelte-19xnkk1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"></path></svg></div> <div class="install-prompt__text svelte-16t91j5" data-svelte-h="svelte-13founr"><div id="install-title" class="install-prompt__title svelte-16t91j5">Install Draconia Chronicles</div> <div id="install-description" class="install-prompt__message svelte-16t91j5">Install this app on your device for a better gaming experience with offline play.</div></div> <div class="install-prompt__actions svelte-16t91j5"><button class="install-prompt__button install-prompt__button--primary svelte-16t91j5" aria-label="Install Draconia Chronicles" data-svelte-h="svelte-1bgr1yg">Install</button> <button class="install-prompt__button install-prompt__button--secondary svelte-16t91j5" aria-label="Dismiss install prompt" data-svelte-h="svelte-4fzknk">Not now</button></div></div></div>` : ``}`;
});
const DevMenu_svelte_svelte_type_style_lang = "";
const css = {
  code: ".dev-menu-container.svelte-1856o6q.svelte-1856o6q{position:fixed;top:20px;right:20px;z-index:1000}.dev-menu-toggle.svelte-1856o6q.svelte-1856o6q{background:rgba(0, 0, 0, 0.8);border:1px solid rgba(255, 255, 255, 0.2);border-radius:8px;color:#fff;cursor:pointer;padding:8px;transition:all 0.2s ease;backdrop-filter:blur(10px)}.dev-menu-toggle.svelte-1856o6q.svelte-1856o6q:hover{background:rgba(0, 0, 0, 0.9);border-color:rgba(255, 255, 255, 0.3);transform:scale(1.05)}.dev-menu-toggle.svelte-1856o6q.svelte-1856o6q:active{transform:scale(0.95)}.dev-menu-panel.svelte-1856o6q.svelte-1856o6q{position:absolute;top:100%;right:0;margin-top:8px;background:rgba(0, 0, 0, 0.95);border:1px solid rgba(255, 255, 255, 0.2);border-radius:12px;padding:16px;min-width:200px;backdrop-filter:blur(20px);box-shadow:0 8px 32px rgba(0, 0, 0, 0.3)}.dev-menu-header.svelte-1856o6q.svelte-1856o6q{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255, 255, 255, 0.1)}.dev-menu-header.svelte-1856o6q h3.svelte-1856o6q{margin:0;color:#fff;font-size:14px;font-weight:600}.dev-menu-close.svelte-1856o6q.svelte-1856o6q{background:none;border:none;color:rgba(255, 255, 255, 0.6);cursor:pointer;padding:4px;border-radius:4px;transition:all 0.2s ease}.dev-menu-close.svelte-1856o6q.svelte-1856o6q:hover{color:#fff;background:rgba(255, 255, 255, 0.1)}.dev-menu-nav.svelte-1856o6q.svelte-1856o6q{display:flex;flex-direction:column;gap:8px}.dev-menu-link.svelte-1856o6q.svelte-1856o6q{display:flex;align-items:center;gap:8px;color:rgba(255, 255, 255, 0.8);text-decoration:none;padding:8px 12px;border-radius:6px;transition:all 0.2s ease;font-size:13px;background:none;border:none;cursor:pointer;width:100%;text-align:left}.dev-menu-link.svelte-1856o6q.svelte-1856o6q:hover{color:#fff;background:rgba(255, 255, 255, 0.1);transform:translateX(2px)}.dev-menu-footer.svelte-1856o6q.svelte-1856o6q{margin-top:16px;padding-top:12px;border-top:1px solid rgba(255, 255, 255, 0.1);text-align:center}.dev-menu-footer.svelte-1856o6q small.svelte-1856o6q{color:rgba(255, 255, 255, 0.5);font-size:11px}@media(max-width: 768px){.dev-menu-container.svelte-1856o6q.svelte-1856o6q{top:10px;right:10px}.dev-menu-panel.svelte-1856o6q.svelte-1856o6q{min-width:180px;padding:12px}}",
  map: null
};
const DevMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $appFlags, $$unsubscribe_appFlags;
  $$unsubscribe_appFlags = subscribe(appFlags, (value) => $appFlags = value);
  $$result.css.add(css);
  $$unsubscribe_appFlags();
  return `${$appFlags.devMenu ? `<div class="dev-menu-container svelte-1856o6q"> <button class="dev-menu-toggle svelte-1856o6q" aria-label="Toggle Developer Menu" title="Developer Menu (dev flag enabled)" data-svelte-h="svelte-2pclfr"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path></svg></button>  ${``}</div>` : ``}`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $hudEnabled, $$unsubscribe_hudEnabled;
  $$unsubscribe_hudEnabled = subscribe(hudEnabled, (value) => $hudEnabled = value);
  let canvas;
  let handle = null;
  onDestroy(() => handle?.destroy());
  $$unsubscribe_hudEnabled();
  return `<div style="position:fixed; inset:0; overflow:hidden;"><canvas style="width:100%; height:100%; display:block;"${add_attribute("this", canvas, 0)}></canvas> ${$hudEnabled ? `${slots.hud ? slots.hud({}) : ``}` : ``}</div>  ${validate_component(UpdateToast, "UpdateToast").$$render($$result, {}, {}, {})}  ${validate_component(InstallPrompt, "InstallPrompt").$$render($$result, {}, {}, {})}  ${validate_component(DevMenu, "DevMenu").$$render($$result, {}, {}, {})} ${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
