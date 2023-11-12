import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['@inlang/paraglide-js']
	},
	ssr: {
		noExternal: ['@inlang/paraglide-js']
	}
})
