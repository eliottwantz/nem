import { sveltekit } from '@sveltejs/kit/vite'
import { paraglide } from '@inlang/paraglide-js-adapter-vite'
import { defineConfig } from 'vite'
import { kitRoutes } from 'vite-plugin-kit-routes'
import type { KIT_ROUTES } from '$lib/ROUTES'

import { createRequire } from 'module'
import path from 'path'

const { resolve } = createRequire(import.meta.url)

const prismaClient = `prisma${path.sep}client`

const prismaClientIndexBrowser = resolve('@prisma/client/index-browser').replace(
	`@${prismaClient}`,
	`.${prismaClient}`
)

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
			},
			default_type: 'string',
			PAGES: {
				'/teachers': {
					explicit_search_params: {
						topic: { default: '"English"', type: 'string' },
						language: { default: '"French"', type: 'string' }
					}
				}
			},
			SERVERS: {
				'GET /api/messages/[chatId]': {
					explicit_search_params: {
						cursor: { type: 'number' }
					}
				}
			}
		})
	],
	resolve: {
		alias: {
			'.prisma/client/index-browser': path.relative(__dirname, prismaClientIndexBrowser)
		}
	}
})
