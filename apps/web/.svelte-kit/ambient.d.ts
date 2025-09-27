
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const LESSOPEN: string;
	export const npm_package_devDependencies__types_node: string;
	export const npm_package_devDependencies_vitest: string;
	export const USER: string;
	export const npm_config_user_agent: string;
	export const XDG_SESSION_TYPE: string;
	export const GIT_ASKPASS: string;
	export const npm_package_dependencies__draconia_logger: string;
	export const npm_package_devDependencies_vite: string;
	export const npm_node_execpath: string;
	export const SHLVL: string;
	export const LD_LIBRARY_PATH: string;
	export const npm_package_devDependencies_canvas: string;
	export const HOME: string;
	export const CHROME_DESKTOP: string;
	export const APPDIR: string;
	export const OLDPWD: string;
	export const DISABLE_AUTO_UPDATE: string;
	export const TERM_PROGRAM_VERSION: string;
	export const DESKTOP_SESSION: string;
	export const PERLLIB: string;
	export const COREPACK_ROOT: string;
	export const npm_package_devDependencies__sveltejs_adapter_static: string;
	export const npm_config_auto_install_peers: string;
	export const GNOME_SHELL_SESSION_MODE: string;
	export const GTK_MODULES: string;
	export const PAGER: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_config_shared_workspace_lockfile: string;
	export const PYDEVD_DISABLE_FILE_VALIDATION: string;
	export const SYSTEMD_EXEC_PID: string;
	export const BUNDLED_DEBUGPY_PATH: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_config_yes: string;
	export const COLORTERM: string;
	export const npm_package_devDependencies_typescript: string;
	export const NVM_DIR: string;
	export const npm_config_prefer_workspace_packages: string;
	export const MANDATORY_PATH: string;
	export const IM_CONFIG_PHASE: string;
	export const COREPACK_ENABLE_DOWNLOAD_PROMPT: string;
	export const npm_package_scripts_dev: string;
	export const GTK_IM_MODULE: string;
	export const LOGNAME: string;
	export const npm_package_type: string;
	export const OWD: string;
	export const _: string;
	export const npm_package_private: string;
	export const XDG_SESSION_CLASS: string;
	export const DEFAULTS_PATH: string;
	export const npm_config_registry: string;
	export const USERNAME: string;
	export const TERM: string;
	export const GNOME_DESKTOP_SESSION_ID: string;
	export const COMPOSER_NO_INTERACTION: string;
	export const WINDOWPATH: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const SESSION_MANAGER: string;
	export const APPIMAGE: string;
	export const npm_package_name: string;
	export const NODE: string;
	export const XDG_MENU_PREFIX: string;
	export const GNOME_TERMINAL_SCREEN: string;
	export const XDG_RUNTIME_DIR: string;
	export const GDK_BACKEND: string;
	export const npm_config_frozen_lockfile: string;
	export const CURSOR_AGENT: string;
	export const DISPLAY: string;
	export const VSCODE_DEBUGPY_ADAPTER_ENDPOINTS: string;
	export const LANG: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const XMODIFIERS: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XAUTHORITY: string;
	export const LS_COLORS: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const GNOME_TERMINAL_SERVICE: string;
	export const TERM_PROGRAM: string;
	export const CURSOR_TRACE_ID: string;
	export const npm_lifecycle_script: string;
	export const SSH_AGENT_LAUNCHER: string;
	export const SSH_AUTH_SOCK: string;
	export const GSETTINGS_SCHEMA_DIR: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const npm_package_scripts_test: string;
	export const npm_package_dependencies_workbox_precaching: string;
	export const npm_package_dependencies_workbox_strategies: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const SHELL: string;
	export const ARGV0: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const NODE_PATH: string;
	export const QT_ACCESSIBILITY: string;
	export const GDMSESSION: string;
	export const npm_package_scripts_build: string;
	export const npm_package_devDependencies_svelte: string;
	export const npm_config_strict_peer_dependencies: string;
	export const LESSCLOSE: string;
	export const npm_package_dependencies__sveltejs_vite_plugin_svelte: string;
	export const GPG_AGENT_INFO: string;
	export const npm_package_dependencies_workbox_routing: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const QT_IM_MODULE: string;
	export const PWD: string;
	export const npm_config_link_workspace_packages: string;
	export const npm_execpath: string;
	export const XDG_CONFIG_DIRS: string;
	export const ANDROID_HOME: string;
	export const NVM_CD_FLAGS: string;
	export const XDG_DATA_DIRS: string;
	export const npm_package_dependencies_pixi_js: string;
	export const npm_command: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const QT_PLUGIN_PATH: string;
	export const npm_package_scripts_preview: string;
	export const npm_package_dependencies_workbox_window: string;
	export const PIP_NO_INPUT: string;
	export const VTE_VERSION: string;
	export const npm_config_shamefully_hoist: string;
	export const INIT_CWD: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		LESSOPEN: string;
		npm_package_devDependencies__types_node: string;
		npm_package_devDependencies_vitest: string;
		USER: string;
		npm_config_user_agent: string;
		XDG_SESSION_TYPE: string;
		GIT_ASKPASS: string;
		npm_package_dependencies__draconia_logger: string;
		npm_package_devDependencies_vite: string;
		npm_node_execpath: string;
		SHLVL: string;
		LD_LIBRARY_PATH: string;
		npm_package_devDependencies_canvas: string;
		HOME: string;
		CHROME_DESKTOP: string;
		APPDIR: string;
		OLDPWD: string;
		DISABLE_AUTO_UPDATE: string;
		TERM_PROGRAM_VERSION: string;
		DESKTOP_SESSION: string;
		PERLLIB: string;
		COREPACK_ROOT: string;
		npm_package_devDependencies__sveltejs_adapter_static: string;
		npm_config_auto_install_peers: string;
		GNOME_SHELL_SESSION_MODE: string;
		GTK_MODULES: string;
		PAGER: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_config_shared_workspace_lockfile: string;
		PYDEVD_DISABLE_FILE_VALIDATION: string;
		SYSTEMD_EXEC_PID: string;
		BUNDLED_DEBUGPY_PATH: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_config_yes: string;
		COLORTERM: string;
		npm_package_devDependencies_typescript: string;
		NVM_DIR: string;
		npm_config_prefer_workspace_packages: string;
		MANDATORY_PATH: string;
		IM_CONFIG_PHASE: string;
		COREPACK_ENABLE_DOWNLOAD_PROMPT: string;
		npm_package_scripts_dev: string;
		GTK_IM_MODULE: string;
		LOGNAME: string;
		npm_package_type: string;
		OWD: string;
		_: string;
		npm_package_private: string;
		XDG_SESSION_CLASS: string;
		DEFAULTS_PATH: string;
		npm_config_registry: string;
		USERNAME: string;
		TERM: string;
		GNOME_DESKTOP_SESSION_ID: string;
		COMPOSER_NO_INTERACTION: string;
		WINDOWPATH: string;
		npm_config_node_gyp: string;
		PATH: string;
		SESSION_MANAGER: string;
		APPIMAGE: string;
		npm_package_name: string;
		NODE: string;
		XDG_MENU_PREFIX: string;
		GNOME_TERMINAL_SCREEN: string;
		XDG_RUNTIME_DIR: string;
		GDK_BACKEND: string;
		npm_config_frozen_lockfile: string;
		CURSOR_AGENT: string;
		DISPLAY: string;
		VSCODE_DEBUGPY_ADAPTER_ENDPOINTS: string;
		LANG: string;
		XDG_CURRENT_DESKTOP: string;
		XMODIFIERS: string;
		XDG_SESSION_DESKTOP: string;
		XAUTHORITY: string;
		LS_COLORS: string;
		VSCODE_GIT_IPC_HANDLE: string;
		GNOME_TERMINAL_SERVICE: string;
		TERM_PROGRAM: string;
		CURSOR_TRACE_ID: string;
		npm_lifecycle_script: string;
		SSH_AGENT_LAUNCHER: string;
		SSH_AUTH_SOCK: string;
		GSETTINGS_SCHEMA_DIR: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		npm_package_scripts_test: string;
		npm_package_dependencies_workbox_precaching: string;
		npm_package_dependencies_workbox_strategies: string;
		npm_package_devDependencies__sveltejs_kit: string;
		SHELL: string;
		ARGV0: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		NODE_PATH: string;
		QT_ACCESSIBILITY: string;
		GDMSESSION: string;
		npm_package_scripts_build: string;
		npm_package_devDependencies_svelte: string;
		npm_config_strict_peer_dependencies: string;
		LESSCLOSE: string;
		npm_package_dependencies__sveltejs_vite_plugin_svelte: string;
		GPG_AGENT_INFO: string;
		npm_package_dependencies_workbox_routing: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		QT_IM_MODULE: string;
		PWD: string;
		npm_config_link_workspace_packages: string;
		npm_execpath: string;
		XDG_CONFIG_DIRS: string;
		ANDROID_HOME: string;
		NVM_CD_FLAGS: string;
		XDG_DATA_DIRS: string;
		npm_package_dependencies_pixi_js: string;
		npm_command: string;
		PNPM_SCRIPT_SRC_DIR: string;
		QT_PLUGIN_PATH: string;
		npm_package_scripts_preview: string;
		npm_package_dependencies_workbox_window: string;
		PIP_NO_INPUT: string;
		VTE_VERSION: string;
		npm_config_shamefully_hoist: string;
		INIT_CWD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
