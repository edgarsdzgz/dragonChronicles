type DynamicRoutes = {
	
};

type Layouts = {
	"/": undefined
};

export type RouteId = "/";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/favicon.png" | "/steak.svg" | "/ui_mockups/Dragon_Idler_UI_Mockup_Forge_A11y_CB_v01.png" | "/ui_mockups/Dragon_Idler_UI_Mockup_Forge_Dark_v02.png" | "/ui_mockups/Dragon_Idler_UI_Mockup_Mobile_Forge_Dark_v01.png" | "/ui_mockups/Dragon_Idler_UI_Mockup_v01.png" | "/ui_mockups/screenshot_mvp.png" | "/ui_mockups/screenshot_mvp2.png";