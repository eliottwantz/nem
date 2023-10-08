import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin'

export const nemTheme: CustomThemeConfig = {
	name: 'nem-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': 'system-ui',
		'--theme-font-family-heading': 'system-ui',
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '12px',
		'--theme-rounded-container': '12px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '0 0 0',
		'--on-secondary': '0 0 0',
		'--on-tertiary': '255 255 255',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '0 0 0',
		'--on-surface': '0 0 0',
		// =~= Theme Colors  =~=
		// primary | #fbdc90
		'--color-primary-50': '254 250 238', // #fefaee
		'--color-primary-100': '254 248 233', // #fef8e9
		'--color-primary-200': '254 246 227', // #fef6e3
		'--color-primary-300': '253 241 211', // #fdf1d3
		'--color-primary-400': '252 231 177', // #fce7b1
		'--color-primary-500': '251 220 144', // #fbdc90
		'--color-primary-600': '226 198 130', // #e2c682
		'--color-primary-700': '188 165 108', // #bca56c
		'--color-primary-800': '151 132 86', // #978456
		'--color-primary-900': '123 108 71', // #7b6c47
		// secondary | #01c4a9
		'--color-secondary-50': '217 246 242', // #d9f6f2
		'--color-secondary-100': '204 243 238', // #ccf3ee
		'--color-secondary-200': '192 240 234', // #c0f0ea
		'--color-secondary-300': '153 231 221', // #99e7dd
		'--color-secondary-400': '77 214 195', // #4dd6c3
		'--color-secondary-500': '1 196 169', // #01c4a9
		'--color-secondary-600': '1 176 152', // #01b098
		'--color-secondary-700': '1 147 127', // #01937f
		'--color-secondary-800': '1 118 101', // #017665
		'--color-secondary-900': '0 96 83', // #006053
		// tertiary | #173496
		'--color-tertiary-50': '220 225 239', // #dce1ef
		'--color-tertiary-100': '209 214 234', // #d1d6ea
		'--color-tertiary-200': '197 204 229', // #c5cce5
		'--color-tertiary-300': '162 174 213', // #a2aed5
		'--color-tertiary-400': '93 113 182', // #5d71b6
		'--color-tertiary-500': '23 52 150', // #173496
		'--color-tertiary-600': '21 47 135', // #152f87
		'--color-tertiary-700': '17 39 113', // #112771
		'--color-tertiary-800': '14 31 90', // #0e1f5a
		'--color-tertiary-900': '11 25 74', // #0b194a
		// success | #7ee280
		'--color-success-50': '236 251 236', // #ecfbec
		'--color-success-100': '229 249 230', // #e5f9e6
		'--color-success-200': '223 248 223', // #dff8df
		'--color-success-300': '203 243 204', // #cbf3cc
		'--color-success-400': '165 235 166', // #a5eba6
		'--color-success-500': '126 226 128', // #7ee280
		'--color-success-600': '113 203 115', // #71cb73
		'--color-success-700': '95 170 96', // #5faa60
		'--color-success-800': '76 136 77', // #4c884d
		'--color-success-900': '62 111 63', // #3e6f3f
		// warning | #ffa305
		'--color-warning-50': '255 241 218', // #fff1da
		'--color-warning-100': '255 237 205', // #ffedcd
		'--color-warning-200': '255 232 193', // #ffe8c1
		'--color-warning-300': '255 218 155', // #ffda9b
		'--color-warning-400': '255 191 80', // #ffbf50
		'--color-warning-500': '255 163 5', // #ffa305
		'--color-warning-600': '230 147 5', // #e69305
		'--color-warning-700': '191 122 4', // #bf7a04
		'--color-warning-800': '153 98 3', // #996203
		'--color-warning-900': '125 80 2', // #7d5002
		// error | #ff5252
		'--color-error-50': '255 229 229', // #ffe5e5
		'--color-error-100': '255 220 220', // #ffdcdc
		'--color-error-200': '255 212 212', // #ffd4d4
		'--color-error-300': '255 186 186', // #ffbaba
		'--color-error-400': '255 134 134', // #ff8686
		'--color-error-500': '255 82 82', // #ff5252
		'--color-error-600': '230 74 74', // #e64a4a
		'--color-error-700': '191 62 62', // #bf3e3e
		'--color-error-800': '153 49 49', // #993131
		'--color-error-900': '125 40 40', // #7d2828
		// surface | #dbdbdb
		'--color-surface-50': '250 250 250', // #fafafa
		'--color-surface-100': '248 248 248', // #f8f8f8
		'--color-surface-200': '246 246 246', // #f6f6f6
		'--color-surface-300': '241 241 241', // #f1f1f1
		'--color-surface-400': '230 230 230', // #e6e6e6
		'--color-surface-500': '219 219 219', // #dbdbdb
		'--color-surface-600': '197 197 197', // #c5c5c5
		'--color-surface-700': '164 164 164', // #a4a4a4
		'--color-surface-800': '131 131 131', // #838383
		'--color-surface-900': '107 107 107' // #6b6b6b
	}
}
