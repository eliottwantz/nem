import { sveltekit } from '@sveltejs/kit/vite'
import { paraglide } from '@inlang/paraglide-js-adapter-vite'
import { defineConfig } from 'vite'
import { kitRoutes } from 'vite-plugin-kit-routes'
import type { KIT_ROUTES } from '$lib/ROUTES'

export default defineConfig({
	plugins: [
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/i18n/paraglide'
		}),
		sveltekit(),
		kitRoutes<KIT_ROUTES>({
			override_params: {
				lang: { type: 'string' }
			}
		})
	]
})
