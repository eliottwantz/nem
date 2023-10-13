import { skeleton } from '@skeletonlabs/tw-plugin'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import lineClamp from '@tailwindcss/line-clamp'
import { join } from 'path'
import type { Config } from 'tailwindcss'
import { nemTheme } from './src/theme'

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		forms,
		typography,
		lineClamp,
		skeleton({
			themes: {
				custom: [nemTheme]
			}
		})
	]
} satisfies Config
