import { c as create_ssr_component } from "../../../../chunks/ssr.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".boom-container.svelte-17cr3ct.svelte-17cr3ct{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);color:white;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif}.boom-content.svelte-17cr3ct.svelte-17cr3ct{text-align:center;max-width:400px;padding:20px}.boom-content.svelte-17cr3ct h1.svelte-17cr3ct{font-size:3rem;margin:0 0 16px 0}.boom-content.svelte-17cr3ct p.svelte-17cr3ct{margin:0 0 12px 0;line-height:1.6}.boom-content.svelte-17cr3ct small.svelte-17cr3ct{opacity:0.8}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-wvmdfp_START -->${$$result.title = `<title>Test Error - Draconia Chronicles</title>`, ""}<!-- HEAD_svelte-wvmdfp_END -->`, ""} <div class="boom-container svelte-17cr3ct" data-svelte-h="svelte-1270cpd"><div class="boom-content svelte-17cr3ct"><h1 class="svelte-17cr3ct">💥 Boom!</h1> <p class="svelte-17cr3ct">This page intentionally triggers an error to test the error boundary.</p> <p class="svelte-17cr3ct">You should be redirected to the error page...</p> <p class="svelte-17cr3ct"><small class="svelte-17cr3ct">If you see this message, something went wrong with the error handling.</small></p></div> </div>`;
});
export {
  Page as default
};
