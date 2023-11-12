import {
	EMAIL_FROM,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	SMTP_HOST,
	SMTP_PASSWORD,
	SMTP_PORT,
	SMTP_USER
} from '$env/static/private'
import { getEnhancedPrisma, prisma } from '$lib/server/prisma'
import { safeDBCall } from '$lib/utils/error'
import { localeFromURL, pathNameWithoutLocale, urlWithLocale } from '$lib/utils/i18n'
import { appRedirect } from '$lib/utils/redirect'
import type { AdapterUser } from '@auth/core/adapters'
import Email from '@auth/core/providers/email'
import Google from '@auth/core/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { SvelteKitAuth } from '@auth/sveltekit'
import { Prisma } from '@prisma/client'
import { redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { setLanguageTag } from 'i18n/runtime'

declare module '@auth/core/types' {
	interface Session {
		user: AdapterUser & DefaultSession['user']
	}
}

export const handle = sequence(
	SvelteKitAuth({
		adapter: PrismaAdapter(prisma),
		providers: [
			Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
			Email({
				server: {
					host: SMTP_HOST,
					port: Number(SMTP_PORT),
					auth: {
						user: SMTP_USER,
						pass: SMTP_PASSWORD
					}
				},
				from: EMAIL_FROM
			})
		],
		theme: {
			brandColor: '#fbdc90',
			colorScheme: 'dark',
			buttonText: 'Sign in with Email',
			logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB3aWR0aD0iMzIuNDkzMTE4bW0iCiAgIGhlaWdodD0iMzMuMjU4NDM4bW0iCiAgIHZpZXdCb3g9IjAgMCAzMi40OTMxMTggMzMuMjU4NDM4IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmc1IgogICB4bWw6c3BhY2U9InByZXNlcnZlIgogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9ImJpdG1hcC5zdmciCiAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIzMDAiCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIzMDAiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlkPSJuYW1lZHZpZXc3IgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzAwMDAwMCIKICAgICBib3JkZXJvcGFjaXR5PSIwLjI1IgogICAgIGlua3NjYXBlOnNob3dwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZWNoZWNrZXJib2FyZD0iMCIKICAgICBpbmtzY2FwZTpkZXNrY29sb3I9IiNkMWQxZDEiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9Im1tIgogICAgIHNob3dncmlkPSJmYWxzZSIgLz48ZGVmcwogICAgIGlkPSJkZWZzMiI+PGlua3NjYXBlOnBhdGgtZWZmZWN0CiAgICAgICBlZmZlY3Q9InNwaXJvIgogICAgICAgaWQ9InBhdGgtZWZmZWN0NzQ0NSIKICAgICAgIGlzX3Zpc2libGU9InRydWUiCiAgICAgICBscGV2ZXJzaW9uPSIxIiAvPjwvZGVmcz48ZwogICAgIGlua3NjYXBlOmxhYmVsPSJMYXllciAxIgogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSIKICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTc3Ljg0MjI1NiwtMTE0LjcxODk1KSI+PGcKICAgICAgIGlkPSJnMTE0IgogICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC4yNjQ1ODMzMywwLDAsMC4yNjQ1ODMzMyw3Ni45MzI2NTksMTE0LjMwNDkzKSI+PGcKICAgICAgICAgc3Ryb2tlLXdpZHRoPSIyIgogICAgICAgICBmaWxsPSJub25lIgogICAgICAgICBzdHJva2UtbGluZWNhcD0iYnV0dCIKICAgICAgICAgaWQ9Imc0MyI+PHBhdGgKICAgICAgICAgICBzdHJva2U9IiM4YjgyNjkiCiAgICAgICAgICAgZD0ibSA3MywxMjUuMjEgYyAyNS4yMywtMy43NyA0Mi4yNSwtMjAuODYgNDkuOTMsLTQ0LjY2IDYuNjgsLTIwLjcyIC0xLjk4LC00Ny4xNyAtMTcuNTYsLTYxLjYxIHEgLTYuMTIsLTUuNjggLTEyLjI5LC05LjAxIC0zLjcsLTIgLTUuNywtMi41NyBMIDc2LjU3LDQuMzEiCiAgICAgICAgICAgaWQ9InBhdGg5IiAvPjxwYXRoCiAgICAgICAgICAgc3Ryb2tlPSIjOGI4MjY5IgogICAgICAgICAgIGQ9Ik0gNzYuNTcsNC4zMSBRIDY2LjQ3LDIuNDIgNTYuNDQsMy40IEMgMzcuNiw1LjI1IDIxLjQ5LDE4LjEyIDEyLjc1LDM0LjQ4IDkuMjQsNDEuMDYgNS43Myw1MS44IDQuOTgsNTguNzMgMS4yMiw5My4zNCAyNC43OCwxMjEgNTguNzQsMTI1Ljc3IHEgNS4xMywwLjcyIDE0LjI2LC0wLjU2IgogICAgICAgICAgIGlkPSJwYXRoMTEiIC8+PHBhdGgKICAgICAgICAgICBzdHJva2U9IiNmYWU2YjUiCiAgICAgICAgICAgZD0iTSA3Ni41Nyw0LjMxIFEgNzUsNS45NCA3My4wNSw2LjQ5IGEgMS4wMSwxIC0xMiAwIDAgLTAuNzIsMS4xIGwgMC4zMSwyLjI4IGEgMC45OSwwLjk5IDAgMCAxIC0xLjMzLDEuMDcgUSA2Ny44NSw5LjY3IDY0LjI1LDEwLjI5IgogICAgICAgICAgIGlkPSJwYXRoMTMiIC8+PHBhdGgKICAgICAgICAgICBzdHJva2U9IiM4YjgyNjkiCiAgICAgICAgICAgZD0ibSA2NC4yNSwxMC4yOSBxIC0yOS4yNiwyLjUgLTQzLjU2LDI3Ljc3IC0wLjE0LDAuMjUgLTAuNjgsMC42OCAtMC42LDAuNDggLTEuMDgsMS43NSAtMy43NiwxMCAtNC41NiwxNi44IEMgMTAuMDQsOTQuMjIgMzYuNzYsMTIxLjE0IDc0LDExNi43MSIKICAgICAgICAgICBpZD0icGF0aDE1IiAvPjxwYXRoCiAgICAgICAgICAgc3Ryb2tlPSIjZmFlNmI1IgogICAgICAgICAgIGQ9Im0gNzQsMTE2LjcxIHEgMC40NywzLjQ1IC0xLjM2LDYuMzYgYyAtMC41NSwwLjg4IC0wLjU1LDEuNTkgMC4zNiwyLjE0IgogICAgICAgICAgIGlkPSJwYXRoMTciIC8+PHBhdGgKICAgICAgICAgICBzdHJva2U9IiM4YjgyNjkiCiAgICAgICAgICAgZD0iTSA3NCwxMTYuNzEgQyA5Ni43MywxMTEgMTE1LjM1LDkxLjcyIDExNS4yNCw2Ny4yNiAxMTUuMiw1Ny4yNCAxMTMuODEsNDYuOTUgMTA4Ljg4LDM4LjA3IDEwMi4wMywyNS43MyA5Mi44MywxNi42OSA3OC41MSwxMy40NSBRIDcxLjM5LDExLjg0IDY0LjI1LDEwLjI5IgogICAgICAgICAgIGlkPSJwYXRoMTkiIC8+PHBhdGgKICAgICAgICAgICBzdHJva2U9IiM4YjgyNjkiCiAgICAgICAgICAgZD0iTSAxMDkuOTE0Miw0NC42MTkxIEEgMS42NCwxLjY0IDAgMCAwIDEwOC4yOCw0Mi45NzM0IEwgMjAuMzgwNSw0Mi42NjY2IGEgMS42NCwxLjY0IDAgMCAwIC0xLjY0NTcsMS42MzQzIGwgLTAuMDA5LDIuNTggYSAxLjY0LDEuNjQgMCAwIDAgMS42MzQyLDEuNjQ1NyBsIDg3Ljg5OTUsMC4zMDY4IGEgMS42NCwxLjY0IDAgMCAwIDEuNjQ1NywtMS42MzQzIGwgMC4wMDksLTIuNTgiCiAgICAgICAgICAgaWQ9InBhdGgyMSIgLz48cGF0aAogICAgICAgICAgIHN0cm9rZT0iIzhiODI2OSIKICAgICAgICAgICBkPSJNIDg2LjgyLDk1LjY5IFEgODUuNDgsOTMuNzggODUuNDgsOTEuMTggODUuNDIsNzEuNzEgODUuODQsNTIuNjEgQSAxLDAuOTkgMS4xIDAgMCA4NC44NSw1MS41OSBMIDQwLDUxLjE1IGEgMSwwLjk5IDEuOCAwIDAgLTEuMDEsMC45NCBxIC0wLjMsNS4zNCAwLjM1LDExLjQ4IDAuNTYsNS4yNiAtMC42LDMyLjk3IGEgMS4wMiwwLjk5IDIyLjYgMCAwIDAuMzQsMC43OSBxIDQuMTEsMy42NiA5Ljc0LDMuNzUgYSAxLDAuOTkgLTg5LjcgMCAwIDEuMDEsLTEuMDEgTCA0OS41Miw2Mi4wNiBhIDEsMSAwIDAgMSAwLjk4LC0xLjAxIGwgMjQuNjcsLTAuMzQgcSAxLjg3LC0wLjAyIDAuODYsMS41NSBsIC0wLjQyLDAuNjQgYSAxLDAuOTQgNjMuNSAwIDAgLTAuMTYsMC41NCBsIC0wLjI3LDQwLjMzIGEgMSwxIDAgMCAwIDEuMTksMC45OSBjIDYuNzQsLTEuMjkgOC44LC00LjU3IDEzLjc1LC04LjI1IHEgMS41NiwtMS4xNiAyLjM4LC0yLjk5IGEgMSwxIDAgMCAwIC0xLjAxLC0xLjQgcSAtMy4xMiwwLjMgLTMuMjIsMy4xNCAtMC4wOCwyLjQgLTEuNDUsMC40MyIKICAgICAgICAgICBpZD0icGF0aDIzIiAvPjxwYXRoCiAgICAgICAgICAgc3Ryb2tlPSIjOGI4MjY5IgogICAgICAgICAgIGQ9Im0gMTcuMTEsNTMuMDEgcSAtMS4yOSwyLjMyIC0wLjk5LDQuOTMgYSAxLDAuOTkgODUuOSAwIDAgMS4wMSwwLjg4IGwgMTkuNzUsLTAuMjkgYSAxLjAxLDEgLTc4LjUgMCAwIDAuOSwtMC42IHEgMS4wMiwtMi4zNCAwLjcsLTQuOTEgYSAxLDAuOTkgODUuOSAwIDAgLTEuMDEsLTAuODggbCAtMTkuNSwwLjM2IGEgMS4wMSwxIDEzLjkgMCAwIC0wLjg2LDAuNTEiCiAgICAgICAgICAgaWQ9InBhdGgyNSIgLz48cGF0aAogICAgICAgICAgIHN0cm9rZT0iIzhiODI2OSIKICAgICAgICAgICBkPSJtIDExMC43OTI2LDUzLjE5MTUgYSAwLjgyLDAuODIgMCAwIDAgLTAuODE1NywtMC44MjQzIEwgODguMTM3Miw1Mi4yNTI5IGEgMC44MiwwLjgyIDAgMCAwIC0wLjgyNDMsMC44MTU3IGwgLTAuMDI1NSw0Ljg3OTkgYSAwLjgyLDAuODIgMCAwIDAgMC44MTU3LDAuODI0MyBsIDIxLjgzOTcsMC4xMTQzIGEgMC44MiwwLjgyIDAgMCAwIDAuODI0MywtMC44MTU3IGwgMC4wMjU1LC00Ljg3OTkiCiAgICAgICAgICAgaWQ9InBhdGgyNyIgLz48cGF0aAogICAgICAgICAgIHN0cm9rZT0iIzhiODI2OSIKICAgICAgICAgICBkPSJtIDM4LjQzNDEsNjMuNzQgYSAxLjM2LDEuMzYgMCAwIDAgLTEuMzQ4LC0xLjM3MTggTCAxNi45MDY4LDYyLjE5MjEgYSAxLjM2LDEuMzYgMCAwIDAgLTEuMzcxOCwxLjM0OCBMIDE1LjUwNTksNjYuODggYSAxLjM2LDEuMzYgMCAwIDAgMS4zNDgsMS4zNzE4IGwgMjAuMTc5MywwLjE3NjEgYSAxLjM2LDEuMzYgMCAwIDAgMS4zNzE4LC0xLjM0OCBMIDM4LjQzNDEsNjMuNzQiCiAgICAgICAgICAgaWQ9InBhdGgyOSIgLz48cGF0aAogICAgICAgICAgIHN0cm9rZT0iIzhiODI2OSIKICAgICAgICAgICBkPSJtIDExMS4yNjgsNjIuODk0MyBhIDAuMzEsMC4zMSAwIDAgMCAtMC4zMDY3LC0wLjMxMzIgTCA4Ny44NjI2LDYyLjMzOTIgYSAwLjMxLDAuMzEgMCAwIDAgLTAuMzEzMywwLjMwNjggbCAtMC4wNTczLDUuNDc5NyBhIDAuMzEsMC4zMSAwIDAgMCAwLjMwNjcsMC4zMTMyIGwgMjMuMDk4NywwLjI0MTkgYSAwLjMxLDAuMzEgMCAwIDAgMC4zMTMzLC0wLjMwNjggbCAwLjA1NzMsLTUuNDc5NyIKICAgICAgICAgICBpZD0icGF0aDMxIiAvPjxwYXRoCiAgICAgICAgICAgc3Ryb2tlPSIjOGI4MjY5IgogICAgICAgICAgIGQ9Im0gNTAuMywxMDQuMyBxIDQuMDQsMi4xMSA4Ljc0LDIuMjIgYSAxLDEgMCAwIDAgMS4wMywtMC45OSBsIDAuMzQsLTQxLjI3IGEgMSwxIDAgMCAwIC0xLC0xLjAxIEggNTMgYSAxLDEgMCAwIDAgLTEsMSB2IDM3LjE1IGEgMSwxIDAgMCAxIC0wLjk1LDEgbCAtMC4zMywwLjAxIHEgLTMuNjcsMC4xOCAtMC40MiwxLjg5IgogICAgICAgICAgIGlkPSJwYXRoMzMiIC8+PHBhdGgKICAgICAgICAgICBzdHJva2U9IiM4YjgyNjkiCiAgICAgICAgICAgZD0ibSA3MS44OTYsNjQuMDk0NiBhIDAuNDcsMC40NyAwIDAgMCAtMC40NzE2LC0wLjQ2ODQgbCAtNy45NTk5LDAuMDI3OCBhIDAuNDcsMC40NyAwIDAgMCAtMC40Njg0LDAuNDcxNyBsIDAuMTQ3OSw0Mi4zNTk3IGEgMC40NywwLjQ3IDAgMCAwIDAuNDcxNiwwLjQ2ODQgbCA3Ljk1OTksLTAuMDI3OCBhIDAuNDcsMC40NyAwIDAgMCAwLjQ2ODQsLTAuNDcxNyBMIDcxLjg5Niw2NC4wOTQ2IgogICAgICAgICAgIGlkPSJwYXRoMzUiIC8+PHBhdGgKICAgICAgICAgICBzdHJva2U9IiM4YjgyNjkiCiAgICAgICAgICAgZD0ibSA5Ny4wNiw3Mi40NCBxIC0zLjk1LC0wLjE3IC03LjkzLC0wLjY3IGEgMS4wMSwxLjAxIDAgMCAwIC0xLjEzLDEgdiA1Ljg3IHEgMCwxLjcgMS4zLDAuNjIgMS40MywtMS4xNiAyLjQ0LC0xLjI0IDQuMTksLTAuMzEgMTguNDgsMC4xNCBhIDEuMDIsMSA0LjEgMCAwIDEuMDMsLTAuODggbCAwLjUsLTQuMDQgYSAxLDEgMCAwIDAgLTEuMDgsLTEuMTIgcSAtNi44MSwwLjYgLTEzLjYxLDAuMzIiCiAgICAgICAgICAgaWQ9InBhdGgzNyIgLz48cGF0aAogICAgICAgICAgIHN0cm9rZT0iIzhiODI2OSIKICAgICAgICAgICBkPSJtIDE1Ljg0LDcyLjgyIHEgLTAuMDksMi44OCAxLjI4LDUuNDEgYSAwLjk5LDAuOTkgMCAwIDAgMC44NywwLjUyIGggMTguNzUgYSAxLjAxLDEgLTg3LjggMCAwIDEsLTAuOTMgbCAwLjMzLC00LjY5IEEgMSwxIDAgMCAwIDM3LjA4LDcyLjA2IEwgMTYuODUsNzEuODUgYSAxLDEgMCAwIDAgLTEuMDEsMC45NyIKICAgICAgICAgICBpZD0icGF0aDM5IiAvPjxwYXRoCiAgICAgICAgICAgc3Ryb2tlPSIjOGI4MjY5IgogICAgICAgICAgIGQ9Im0gOTkuMDgsOTAuNDggcSAtNi43Niw4LjAzIC05LjM4LDkuOTcgYyAtMTQuNTQsMTAuODMgLTI5LjkzLDEwLjg3IC00NS42MywyLjcyIHEgLTYuNCwtMy4zMiAtNy41NiwtNC42OSAtNC4xMywtNC45IC04LjY0LC05LjU4IC0xLjQ0LC0xLjQ5IDAuNjMsLTEuMzUgbCAzLjk2LDAuMjcgYSAxLjAxLDAuOTMgLTU0LjggMCAwIDAuNTIsLTAuMTEgcSAyLjQyLC0xLjIyIDEuNzksMS43OCAtMC41NiwyLjY5IDAuODUsNC42OSAxLjY5LDIuMzggMS44MiwtMC41NCBsIDAuNDUsLTEwLjMzIGEgMSwxIDAgMCAwIC0xLC0xLjA0IEwgMTkuNzcsODIuMjUgYSAxLDEgMCAwIDAgLTAuOTUsMS4zMyBxIDQuNzIsMTMuNDMgMTYuNzEsMjEuMzUgYyAxMS4yMyw3LjQyIDI1Ljk4LDEyLjExIDM4LjI1LDguODEgcSAyNC43MywtNi42NiAzNS40OSwtMzAuNjMgQSAxLDEgMCAwIDAgMTA4LjMzLDgxLjcgTCA4OC44LDgyLjMgYSAxLjAxLDAuOTkgLTg4LjcgMCAwIC0wLjk3LDAuOTQgbCAtMC4zNCw2LjIxIGEgMSwxIDAgMCAwIDEuMTcsMS4wNCBsIDkuNDgsLTEuNjMgcSAyLjcxLC0wLjQ3IDAuOTQsMS42MiIKICAgICAgICAgICBpZD0icGF0aDQxIgogICAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIgLz48L2c+PHBhdGgKICAgICAgICAgZmlsbD0iIzFjMWUxZCIKICAgICAgICAgZD0ibSAzLjQ0LDY0LjkyIGMgLTAuMDksLTkuNzYgMi42NSwtMjAuODQgNywtMjkuNDggUSAxOS40OSwxNy41MSAzNy41OCw3LjY2IEMgNDkuMTcsMS4zNCA1Ny4yNywxLjI3IDcwLjU3LDEuNzcgYyAwLjksMC4wMyAxLjcsLTAuNjIgMi44MSwwLjI1IHEgMC4yMSwwLjE3IDAuNDcsMC4yIGMgMTcuOTQsMi42OCAzNC4wNCwxMy4wNyA0My4xNiwyOC45NCA4LjI4LDE0LjQxIDExLjcxLDMyLjQxIDcuMzEsNDguNjggLTcuMjEsMjYuNjcgLTI4LjQ3LDQ0LjQ0IC01NS44Miw0Ny4xNyBxIC0xMC43NCwxLjA2IC0yMS4wMSwtMi4yNyBDIDIwLjE4LDExNS44OCAzLjcsOTMuNSAzLjQ0LDY0LjkyIFogTSA3MywxMjUuMjEgYyAyNS4yMywtMy43NyA0Mi4yNSwtMjAuODYgNDkuOTMsLTQ0LjY2IDYuNjgsLTIwLjcyIC0xLjk4LC00Ny4xNyAtMTcuNTYsLTYxLjYxIHEgLTYuMTIsLTUuNjggLTEyLjI5LC05LjAxIC0zLjcsLTIgLTUuNywtMi41NyBMIDc2LjU3LDQuMzEgUSA2Ni40NywyLjQyIDU2LjQ0LDMuNCBDIDM3LjYsNS4yNSAyMS40OSwxOC4xMiAxMi43NSwzNC40OCA5LjI0LDQxLjA2IDUuNzMsNTEuOCA0Ljk4LDU4LjczIDEuMjIsOTMuMzQgMjQuNzgsMTIxIDU4Ljc0LDEyNS43NyBxIDUuMTMsMC43MiAxNC4yNiwtMC41NiB6IgogICAgICAgICBpZD0icGF0aDQ1IgogICAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiIC8+PHBhdGgKICAgICAgICAgZmlsbD0iI2ZhZTZiNSIKICAgICAgICAgZD0iTSA3Ni41Nyw0LjMxIFEgNzUsNS45NCA3My4wNSw2LjQ5IGEgMS4wMSwxIC0xMiAwIDAgLTAuNzIsMS4xIGwgMC4zMSwyLjI4IGEgMC45OSwwLjk5IDAgMCAxIC0xLjMzLDEuMDcgcSAtMy40NiwtMS4yNyAtNy4wNiwtMC42NSAtMjkuMjYsMi41IC00My41NiwyNy43NyAtMC4xNCwwLjI1IC0wLjY4LDAuNjggLTAuNiwwLjQ4IC0xLjA4LDEuNzUgLTMuNzYsMTAgLTQuNTYsMTYuOCBDIDEwLjA0LDk0LjIyIDM2Ljc2LDEyMS4xNCA3NCwxMTYuNzEgcSAwLjQ3LDMuNDUgLTEuMzYsNi4zNiBjIC0wLjU1LDAuODggLTAuNTUsMS41OSAwLjM2LDIuMTQgcSAtOS4xMywxLjI4IC0xNC4yNiwwLjU2IEMgMjQuNzgsMTIxIDEuMjIsOTMuMzQgNC45OCw1OC43MyA1LjczLDUxLjggOS4yNCw0MS4wNiAxMi43NSwzNC40OCAyMS40OSwxOC4xMiAzNy42LDUuMjUgNTYuNDQsMy40IFEgNjYuNDcsMi40MiA3Ni41Nyw0LjMxIFoiCiAgICAgICAgIGlkPSJwYXRoNDciCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNmYmRjOGY7ZmlsbC1vcGFjaXR5OjEiIC8+PHBhdGgKICAgICAgICAgZmlsbD0iI2ZhZTZiNSIKICAgICAgICAgZD0ibSA3Ni41Nyw0LjMxIDEwLjgxLDMuMDUgcSAyLDAuNTcgNS43LDIuNTcgNi4xNywzLjMzIDEyLjI5LDkuMDEgYyAxNS41OCwxNC40NCAyNC4yNCw0MC44OSAxNy41Niw2MS42MSAtNy42OCwyMy44IC0yNC43LDQwLjg5IC00OS45Myw0NC42NiAtMC45MSwtMC41NSAtMC45MSwtMS4yNiAtMC4zNiwtMi4xNCBxIDEuODMsLTIuOTEgMS4zNiwtNi4zNiBDIDk2LjczLDExMSAxMTUuMzUsOTEuNzIgMTE1LjI0LDY3LjI2IDExNS4yLDU3LjI0IDExMy44MSw0Ni45NSAxMDguODgsMzguMDcgMTAyLjAzLDI1LjczIDkyLjgzLDE2LjY5IDc4LjUxLDEzLjQ1IHEgLTcuMTIsLTEuNjEgLTE0LjI2LC0zLjE2IDMuNiwtMC42MiA3LjA2LDAuNjUgQSAwLjk5LDAuOTkgMCAwIDAgNzIuNjQsOS44NyBMIDcyLjMzLDcuNTkgYSAxLjAxLDEgLTEyIDAgMSAwLjcyLC0xLjEgUSA3NSw1Ljk0IDc2LjU3LDQuMzEgWiIKICAgICAgICAgaWQ9InBhdGg0OSIKICAgICAgICAgc3R5bGU9ImRpc3BsYXk6aW5saW5lO2ZpbGw6I2ZiZGM4ZjtmaWxsLW9wYWNpdHk6MSIgLz48cGF0aAogICAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZS13aWR0aDowLjI2NDU4MyIKICAgICAgICAgZD0ibSA4MC41NjQzODMsMTMxLjQzNzcyIGMgLTAuMDg2MDQsLTMuNzMwNSAxLjI1MjY4NSwtNy41MDE3MiAzLjc4MDE3NywtMTAuMjQ2ODcgMi41Mjc0OTMsLTIuNzQ1MTUgNi4yMzc4NDgsLTQuNDAxMzQgOS45NjgxNjYsLTQuMzA3NTYgMy42NDMyMzgsMC4wOTE2IDcuMTg1ODY0LDEuODQ1NzQgOS41NzQwNjQsNC41OTg1NyAyLjM4ODIsMi43NTI4MyAzLjYxOTg0LDYuNDQ3NzEgMy41MDI1MywxMC4wOTAyMSAtMC4xMTE3NCwzLjQ2OTQ5IC0xLjQ0MjkxLDYuOTA5NCAtMy43OTQ3MSw5LjQ2MjYgLTIuMzUxNzksMi41NTMyMSAtNS43MjI4NDQsNC4xNzM2NyAtOS4xOTIzMiw0LjI4NTc0IC0zLjYzMTU4NywwLjExNzMgLTcuMjU4MTEsLTEuNDI4IC05Ljc5MDExLC00LjAzMzk4IC0yLjUzMTk5OSwtMi42MDU5OSAtMy45NjQwMTYsLTYuMjE2MiAtNC4wNDc3OTcsLTkuODQ4NzEgeiIKICAgICAgICAgaWQ9InBhdGg3NDQzIgogICAgICAgICBpbmtzY2FwZTpwYXRoLWVmZmVjdD0iI3BhdGgtZWZmZWN0NzQ0NSIKICAgICAgICAgaW5rc2NhcGU6b3JpZ2luYWwtZD0ibSA4MC41NjQzODMsMTMxLjQzNzcyIGMgLTQuNjEyODk5LC00LjYyNzgyIDkuMTY1ODI1LC05LjcwMjY5IDEzLjc0ODM0MywtMTQuNTU0NDMgNC41ODI1MTQsLTQuODUxNzQgOC43MTc5OTQsOS43OTI3OSAxMy4wNzY1OTQsMTQuNjg4NzggNC4zNTg2MSw0Ljg5NiAtOC42NTc3NTQsOS4xNjU4MyAtMTIuOTg3MDMsMTMuNzQ4MzQgLTQuMzI5Mjc0LDQuNTgyNTIgLTkuMjI1MDA1LC05LjI1NDg2IC0xMy44Mzc5MDcsLTEzLjg4MjY5IHoiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDMuNzc5NTI3NiwwLDAsMy43Nzk1Mjc2LC0yOTAuNzY5MTEsLTQzMi4wMTg2NCkiIC8+PHBhdGgKICAgICAgICAgZmlsbD0iIzFjMWUxZCIKICAgICAgICAgZD0ibSA2NC4yNSwxMC4yOSBxIDcuMTQsMS41NSAxNC4yNiwzLjE2IGMgMTQuMzIsMy4yNCAyMy41MiwxMi4yOCAzMC4zNywyNC42MiA0LjkzLDguODggNi4zMiwxOS4xNyA2LjM2LDI5LjE5IEMgMTE1LjM1LDkxLjcyIDk2LjczLDExMSA3NCwxMTYuNzEgMzYuNzYsMTIxLjE0IDEwLjA0LDk0LjIyIDE0LjM3LDU3LjI5IHEgMC44LC02LjggNC41NiwtMTYuOCAwLjQ4LC0xLjI3IDEuMDgsLTEuNzUgMC41NCwtMC40MyAwLjY4LC0wLjY4IDE0LjMsLTI1LjI3IDQzLjU2LC0yNy43NyB6IG0gNDUuNjY0MiwzNC4zMjkxIEEgMS42NCwxLjY0IDAgMCAwIDEwOC4yOCw0Mi45NzM0IEwgMjAuMzgwNSw0Mi42NjY2IGEgMS42NCwxLjY0IDAgMCAwIC0xLjY0NTcsMS42MzQzIGwgLTAuMDA5LDIuNTggYSAxLjY0LDEuNjQgMCAwIDAgMS42MzQyLDEuNjQ1NyBsIDg3Ljg5OTUsMC4zMDY4IGEgMS42NCwxLjY0IDAgMCAwIDEuNjQ1NywtMS42MzQzIHogTSA4Ni44Miw5NS42OSBRIDg1LjQ4LDkzLjc4IDg1LjQ4LDkxLjE4IDg1LjQyLDcxLjcxIDg1Ljg0LDUyLjYxIEEgMSwwLjk5IDEuMSAwIDAgODQuODUsNTEuNTkgTCA0MCw1MS4xNSBhIDEsMC45OSAxLjggMCAwIC0xLjAxLDAuOTQgcSAtMC4zLDUuMzQgMC4zNSwxMS40OCAwLjU2LDUuMjYgLTAuNiwzMi45NyBhIDEuMDIsMC45OSAyMi42IDAgMCAwLjM0LDAuNzkgcSA0LjExLDMuNjYgOS43NCwzLjc1IGEgMSwwLjk5IC04OS43IDAgMCAxLjAxLC0xLjAxIEwgNDkuNTIsNjIuMDYgYSAxLDEgMCAwIDEgMC45OCwtMS4wMSBsIDI0LjY3LC0wLjM0IHEgMS44NywtMC4wMiAwLjg2LDEuNTUgbCAtMC40MiwwLjY0IGEgMSwwLjk0IDYzLjUgMCAwIC0wLjE2LDAuNTQgbCAtMC4yNyw0MC4zMyBhIDEsMSAwIDAgMCAxLjE5LDAuOTkgYyA2Ljc0LC0xLjI5IDguOCwtNC41NyAxMy43NSwtOC4yNSBxIDEuNTYsLTEuMTYgMi4zOCwtMi45OSBhIDEsMSAwIDAgMCAtMS4wMSwtMS40IHEgLTMuMTIsMC4zIC0zLjIyLDMuMTQgLTAuMDgsMi40IC0xLjQ1LDAuNDMgeiBNIDE3LjExLDUzLjAxIHEgLTEuMjksMi4zMiAtMC45OSw0LjkzIGEgMSwwLjk5IDg1LjkgMCAwIDEuMDEsMC44OCBsIDE5Ljc1LC0wLjI5IGEgMS4wMSwxIC03OC41IDAgMCAwLjksLTAuNiBxIDEuMDIsLTIuMzQgMC43LC00LjkxIGEgMSwwLjk5IDg1LjkgMCAwIC0xLjAxLC0wLjg4IGwgLTE5LjUsMC4zNiBhIDEuMDEsMSAxMy45IDAgMCAtMC44NiwwLjUxIHogbSA5My42ODI2LDAuMTgxNSBhIDAuODIsMC44MiAwIDAgMCAtMC44MTU3LC0wLjgyNDMgTCA4OC4xMzcyLDUyLjI1MjkgYSAwLjgyLDAuODIgMCAwIDAgLTAuODI0MywwLjgxNTcgbCAtMC4wMjU1LDQuODc5OSBhIDAuODIsMC44MiAwIDAgMCAwLjgxNTcsMC44MjQzIGwgMjEuODM5NywwLjExNDMgYSAwLjgyLDAuODIgMCAwIDAgMC44MjQzLC0wLjgxNTcgeiBNIDM4LjQzNDEsNjMuNzQgYSAxLjM2LDEuMzYgMCAwIDAgLTEuMzQ4LC0xLjM3MTggTCAxNi45MDY4LDYyLjE5MjEgYSAxLjM2LDEuMzYgMCAwIDAgLTEuMzcxOCwxLjM0OCBMIDE1LjUwNTksNjYuODggYSAxLjM2LDEuMzYgMCAwIDAgMS4zNDgsMS4zNzE4IGwgMjAuMTc5MywwLjE3NjEgYSAxLjM2LDEuMzYgMCAwIDAgMS4zNzE4LC0xLjM0OCB6IG0gNzIuODMzOSwtMC44NDU3IGEgMC4zMSwwLjMxIDAgMCAwIC0wLjMwNjcsLTAuMzEzMiBMIDg3Ljg2MjYsNjIuMzM5MiBhIDAuMzEsMC4zMSAwIDAgMCAtMC4zMTMzLDAuMzA2OCBsIC0wLjA1NzMsNS40Nzk3IGEgMC4zMSwwLjMxIDAgMCAwIDAuMzA2NywwLjMxMzIgbCAyMy4wOTg3LDAuMjQxOSBhIDAuMzEsMC4zMSAwIDAgMCAwLjMxMzMsLTAuMzA2OCB6IE0gNTAuMywxMDQuMyBxIDQuMDQsMi4xMSA4Ljc0LDIuMjIgYSAxLDEgMCAwIDAgMS4wMywtMC45OSBsIDAuMzQsLTQxLjI3IGEgMSwxIDAgMCAwIC0xLC0xLjAxIEggNTMgYSAxLDEgMCAwIDAgLTEsMSB2IDM3LjE1IGEgMSwxIDAgMCAxIC0wLjk1LDEgbCAtMC4zMywwLjAxIHEgLTMuNjcsMC4xOCAtMC40MiwxLjg5IHogTSA3MS44OTYsNjQuMDk0NiBhIDAuNDcsMC40NyAwIDAgMCAtMC40NzE2LC0wLjQ2ODQgbCAtNy45NTk5LDAuMDI3OCBhIDAuNDcsMC40NyAwIDAgMCAtMC40Njg0LDAuNDcxNyBsIDAuMTQ3OSw0Mi4zNTk3IGEgMC40NywwLjQ3IDAgMCAwIDAuNDcxNiwwLjQ2ODQgbCA3Ljk1OTksLTAuMDI3OCBhIDAuNDcsMC40NyAwIDAgMCAwLjQ2ODQsLTAuNDcxNyB6IE0gOTcuMDYsNzIuNDQgcSAtMy45NSwtMC4xNyAtNy45MywtMC42NyBhIDEuMDEsMS4wMSAwIDAgMCAtMS4xMywxIHYgNS44NyBxIDAsMS43IDEuMywwLjYyIDEuNDMsLTEuMTYgMi40NCwtMS4yNCA0LjE5LC0wLjMxIDE4LjQ4LDAuMTQgYSAxLjAyLDEgNC4xIDAgMCAxLjAzLC0wLjg4IGwgMC41LC00LjA0IGEgMSwxIDAgMCAwIC0xLjA4LC0xLjEyIHEgLTYuODEsMC42IC0xMy42MSwwLjMyIHogbSAtODEuMjIsMC4zOCBxIC0wLjA5LDIuODggMS4yOCw1LjQxIGEgMC45OSwwLjk5IDAgMCAwIDAuODcsMC41MiBoIDE4Ljc1IGEgMS4wMSwxIC04Ny44IDAgMCAxLC0wLjkzIGwgMC4zMywtNC42OSBBIDEsMSAwIDAgMCAzNy4wOCw3Mi4wNiBMIDE2Ljg1LDcxLjg1IGEgMSwxIDAgMCAwIC0xLjAxLDAuOTcgeiBtIDgzLjI0LDE3LjY2IHEgLTYuNzYsOC4wMyAtOS4zOCw5Ljk3IGMgLTE0LjU0LDEwLjgzIC0yOS45MywxMC44NyAtNDUuNjMsMi43MiBxIC02LjQsLTMuMzIgLTcuNTYsLTQuNjkgLTQuMTMsLTQuOSAtOC42NCwtOS41OCAtMS40NCwtMS40OSAwLjYzLC0xLjM1IGwgMy45NiwwLjI3IGEgMS4wMSwwLjkzIC01NC44IDAgMCAwLjUyLC0wLjExIHEgMi40MiwtMS4yMiAxLjc5LDEuNzggLTAuNTYsMi42OSAwLjg1LDQuNjkgMS42OSwyLjM4IDEuODIsLTAuNTQgbCAwLjQ1LC0xMC4zMyBhIDEsMSAwIDAgMCAtMSwtMS4wNCBMIDE5Ljc3LDgyLjI1IGEgMSwxIDAgMCAwIC0wLjk1LDEuMzMgcSA0LjcyLDEzLjQzIDE2LjcxLDIxLjM1IGMgMTEuMjMsNy40MiAyNS45OCwxMi4xMSAzOC4yNSw4LjgxIHEgMjQuNzMsLTYuNjYgMzUuNDksLTMwLjYzIEEgMSwxIDAgMCAwIDEwOC4zMyw4MS43IEwgODguOCw4Mi4zIGEgMS4wMSwwLjk5IC04OC43IDAgMCAtMC45NywwLjk0IGwgLTAuMzQsNi4yMSBhIDEsMSAwIDAgMCAxLjE3LDEuMDQgbCA5LjQ4LC0xLjYzIHEgMi43MSwtMC40NyAwLjk0LDEuNjIgeiIKICAgICAgICAgaWQ9InBhdGg1MSIKICAgICAgICAgc3R5bGU9ImRpc3BsYXk6aW5saW5lO2ZpbGw6IzE0MTQxNDtmaWxsLW9wYWNpdHk6MSIgLz48cGF0aAogICAgICAgICBmaWxsPSIjZmFlNmI1IgogICAgICAgICBkPSJtIDEwOS45MDUyLDQ3LjE5OTEgYSAxLjY0LDEuNjQgMCAwIDEgLTEuNjQ1NywxLjYzNDMgTCAyMC4zNiw0OC41MjY2IGEgMS42NCwxLjY0IDAgMCAxIC0xLjYzNDIsLTEuNjQ1NyBsIDAuMDA5LC0yLjU4IGEgMS42NCwxLjY0IDAgMCAxIDEuNjQ1NywtMS42MzQzIGwgODcuODk5NSwwLjMwNjggYSAxLjY0LDEuNjQgMCAwIDEgMS42MzQyLDEuNjQ1NyB6IgogICAgICAgICBpZD0icGF0aDUzIgogICAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmJkYzhmO2ZpbGwtb3BhY2l0eToxIiAvPjxwYXRoCiAgICAgICAgIGZpbGw9IiNmYWU2YjUiCiAgICAgICAgIGQ9Im0gODguMjcsOTUuMjYgcSAwLjEsLTIuODQgMy4yMiwtMy4xNCBhIDEsMSAwIDAgMSAxLjAxLDEuNCBxIC0wLjgyLDEuODMgLTIuMzgsMi45OSBjIC00Ljk1LDMuNjggLTcuMDEsNi45NiAtMTMuNzUsOC4yNSBhIDEsMSAwIDAgMSAtMS4xOSwtMC45OSBsIDAuMjcsLTQwLjMzIGEgMSwwLjk0IDYzLjUgMCAxIDAuMTYsLTAuNTQgbCAwLjQyLC0wLjY0IHEgMS4wMSwtMS41NyAtMC44NiwtMS41NSBMIDUwLjUsNjEuMDUgYSAxLDEgMCAwIDAgLTAuOTgsMS4wMSBsIDAuMzEsMzguMDEgYSAxLDAuOTkgLTg5LjcgMCAxIC0xLjAxLDEuMDEgcSAtNS42MywtMC4wOSAtOS43NCwtMy43NSBBIDEuMDIsMC45OSAyMi42IDAgMSAzOC43NCw5Ni41NCBRIDM5LjksNjguODMgMzkuMzQsNjMuNTcgMzguNjksNTcuNDMgMzguOTksNTIuMDkgQSAxLDAuOTkgMS44IDAgMSA0MCw1MS4xNSBsIDQ0Ljg1LDAuNDQgYSAxLDAuOTkgMS4xIDAgMSAwLjk5LDEuMDIgcSAtMC40MiwxOS4xIC0wLjM2LDM4LjU3IDAsMi42IDEuMzQsNC41MSAxLjM3LDEuOTcgMS40NSwtMC40MyB6IgogICAgICAgICBpZD0icGF0aDU1IgogICAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmUiIC8+PHBhdGgKICAgICAgICAgZmlsbD0iI2ZhZTZiNSIKICAgICAgICAgZD0ibSAxNy4xMSw1My4wMSBhIDEuMDEsMSAxMy45IDAgMSAwLjg2LC0wLjUxIGwgMTkuNSwtMC4zNiBhIDEsMC45OSA4NS45IDAgMSAxLjAxLDAuODggcSAwLjMyLDIuNTcgLTAuNyw0LjkxIGEgMS4wMSwxIC03OC41IDAgMSAtMC45LDAuNiBsIC0xOS43NSwwLjI5IGEgMSwwLjk5IDg1LjkgMCAxIC0xLjAxLC0wLjg4IHEgLTAuMywtMi42MSAwLjk5LC00LjkzIHoiCiAgICAgICAgIGlkPSJwYXRoNTciCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNmYmRjOGY7ZmlsbC1vcGFjaXR5OjEiIC8+PHBhdGgKICAgICAgICAgZmlsbD0iI2ZhZTZiNSIKICAgICAgICAgZD0ibSAxMTAuNzY3MSw1OC4wNzE0IGEgMC44MiwwLjgyIDAgMCAxIC0wLjgyNDMsMC44MTU3IEwgODguMTAzMSw1OC43NzI4IGEgMC44MiwwLjgyIDAgMCAxIC0wLjgxNTcsLTAuODI0MyBsIDAuMDI1NSwtNC44Nzk5IGEgMC44MiwwLjgyIDAgMCAxIDAuODI0MywtMC44MTU3IGwgMjEuODM5NywwLjExNDMgYSAwLjgyLDAuODIgMCAwIDEgMC44MTU3LDAuODI0MyB6IgogICAgICAgICBpZD0icGF0aDU5IgogICAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmJkYzhmO2ZpbGwtb3BhY2l0eToxIiAvPjxwYXRoCiAgICAgICAgIGZpbGw9IiNmYWU2YjUiCiAgICAgICAgIGQ9Im0gMzguNDA1LDY3LjA3OTkgYSAxLjM2LDEuMzYgMCAwIDEgLTEuMzcxOCwxLjM0OCBMIDE2Ljg1MzksNjguMjUxOCBBIDEuMzYsMS4zNiAwIDAgMSAxNS41MDU5LDY2Ljg4IGwgMC4wMjkxLC0zLjMzOTkgYSAxLjM2LDEuMzYgMCAwIDEgMS4zNzE4LC0xLjM0OCBsIDIwLjE3OTMsMC4xNzYxIGEgMS4zNiwxLjM2IDAgMCAxIDEuMzQ4LDEuMzcxOCB6IgogICAgICAgICBpZD0icGF0aDYxIgogICAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmJkYzhmO2ZpbGwtb3BhY2l0eToxIiAvPjxwYXRoCiAgICAgICAgIGZpbGw9IiNmYWU2YjUiCiAgICAgICAgIGQ9Im0gMTExLjIxMDcsNjguMzc0IGEgMC4zMSwwLjMxIDAgMCAxIC0wLjMxMzMsMC4zMDY4IEwgODcuNzk4Nyw2OC40Mzg5IEEgMC4zMSwwLjMxIDAgMCAxIDg3LjQ5Miw2OC4xMjU3IGwgMC4wNTczLC01LjQ3OTcgYSAwLjMxLDAuMzEgMCAwIDEgMC4zMTMzLC0wLjMwNjggbCAyMy4wOTg3LDAuMjQxOSBhIDAuMzEsMC4zMSAwIDAgMSAwLjMwNjcsMC4zMTMyIHoiCiAgICAgICAgIGlkPSJwYXRoNjMiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZTtmaWxsOiNmYmRjOGY7ZmlsbC1vcGFjaXR5OjEiIC8+PHBhdGgKICAgICAgICAgZmlsbD0iI2ZhZTZiNSIKICAgICAgICAgZD0ibSA1MC4zLDEwNC4zIHEgLTMuMjUsLTEuNzEgMC40MiwtMS44OSBsIDAuMzMsLTAuMDEgYSAxLDEgMCAwIDAgMC45NSwtMSBWIDY0LjI1IGEgMSwxIDAgMCAxIDEsLTEgaCA2LjQxIGEgMSwxIDAgMCAxIDEsMS4wMSBsIC0wLjM0LDQxLjI3IGEgMSwxIDAgMCAxIC0xLjAzLDAuOTkgcSAtNC43LC0wLjExIC04Ljc0LC0yLjIyIHoiCiAgICAgICAgIGlkPSJwYXRoNjUiCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIgLz48cGF0aAogICAgICAgICBmaWxsPSIjZmFlNmI1IgogICAgICAgICBkPSJtIDcyLjA0MzksMTA2LjQ1NDMgYSAwLjQ3LDAuNDcgMCAwIDEgLTAuNDY4NCwwLjQ3MTcgbCAtNy45NTk5LDAuMDI3OCBBIDAuNDcsMC40NyAwIDAgMSA2My4xNDQsMTA2LjQ4NTQgTCA2Mi45OTYxLDY0LjEyNTcgYSAwLjQ3LDAuNDcgMCAwIDEgMC40Njg0LC0wLjQ3MTcgbCA3Ljk1OTksLTAuMDI3OCBhIDAuNDcsMC40NyAwIDAgMSAwLjQ3MTYsMC40Njg0IHoiCiAgICAgICAgIGlkPSJwYXRoNjciCiAgICAgICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSIgLz48cGF0aAogICAgICAgICBmaWxsPSIjZmFlNmI1IgogICAgICAgICBkPSJtIDk3LjA2LDcyLjQ0IHEgNi44LDAuMjggMTMuNjEsLTAuMzIgYSAxLDEgMCAwIDEgMS4wOCwxLjEyIGwgLTAuNSw0LjA0IGEgMS4wMiwxIDQuMSAwIDEgLTEuMDMsMC44OCBRIDk1LjkzLDc3LjcxIDkxLjc0LDc4LjAyIDkwLjczLDc4LjEgODkuMyw3OS4yNiA4OCw4MC4zNCA4OCw3OC42NCB2IC01Ljg3IGEgMS4wMSwxLjAxIDAgMCAxIDEuMTMsLTEgcSAzLjk4LDAuNSA3LjkzLDAuNjcgeiIKICAgICAgICAgaWQ9InBhdGg2OSIKICAgICAgICAgc3R5bGU9ImRpc3BsYXk6aW5saW5lO2ZpbGw6I2ZiZGM4ZjtmaWxsLW9wYWNpdHk6MSIgLz48cGF0aAogICAgICAgICBmaWxsPSIjZmFlNmI1IgogICAgICAgICBkPSJtIDE1Ljg0LDcyLjgyIGEgMSwxIDAgMCAxIDEuMDEsLTAuOTcgbCAyMC4yMywwLjIxIGEgMSwxIDAgMCAxIDAuOTksMS4wNyBsIC0wLjMzLDQuNjkgYSAxLjAxLDEgLTg3LjggMCAxIC0xLDAuOTMgSCAxNy45OSBBIDAuOTksMC45OSAwIDAgMSAxNy4xMiw3OC4yMyBRIDE1Ljc1LDc1LjcgMTUuODQsNzIuODIgWiIKICAgICAgICAgaWQ9InBhdGg3MSIKICAgICAgICAgc3R5bGU9ImRpc3BsYXk6aW5saW5lO2ZpbGw6I2ZiZGM4ZjtmaWxsLW9wYWNpdHk6MSIgLz48cGF0aAogICAgICAgICBmaWxsPSIjZmFlNmI1IgogICAgICAgICBkPSJtIDk4LjE0LDg4Ljg2IC05LjQ4LDEuNjMgYSAxLDEgMCAwIDEgLTEuMTcsLTEuMDQgbCAwLjM0LC02LjIxIEEgMS4wMSwwLjk5IC04OC43IDAgMSA4OC44LDgyLjMgbCAxOS41MywtMC42IGEgMSwxIDAgMCAxIDAuOTQsMS40MSBxIC0xMC43NiwyMy45NyAtMzUuNDksMzAuNjMgYyAtMTIuMjcsMy4zIC0yNy4wMiwtMS4zOSAtMzguMjUsLTguODEgUSAyMy41NCw5Ny4wMSAxOC44Miw4My41OCBhIDEsMSAwIDAgMSAwLjk1LC0xLjMzIGwgMTcuMTIsMC4wMiBhIDEsMSAwIDAgMSAxLDEuMDQgbCAtMC40NSwxMC4zMyBxIC0wLjEzLDIuOTIgLTEuODIsMC41NCAtMS40MSwtMiAtMC44NSwtNC42OSAwLjYzLC0zIC0xLjc5LC0xLjc4IGEgMS4wMSwwLjkzIC01NC44IDAgMSAtMC41MiwwLjExIEwgMjguNSw4Ny41NSBxIC0yLjA3LC0wLjE0IC0wLjYzLDEuMzUgNC41MSw0LjY4IDguNjQsOS41OCAxLjE2LDEuMzcgNy41Niw0LjY5IGMgMTUuNyw4LjE1IDMxLjA5LDguMTEgNDUuNjMsLTIuNzIgcSAyLjYyLC0xLjk0IDkuMzgsLTkuOTcgMS43NywtMi4wOSAtMC45NCwtMS42MiB6IgogICAgICAgICBpZD0icGF0aDczIgogICAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmJkYzhmO2ZpbGwtb3BhY2l0eToxIiAvPjwvZz48L2c+PC9zdmc+Cg=='
		},
		pages: {
			signIn: '/signin',
			signOut: '/signout',
			verifyRequest: '/verifyRequest',
			error: '/error'
		},
		callbacks: {
			session: async ({ session, user }) => {
				session.user = user
				return session
			}
		}
	}),
	async function ({ event, resolve }) {
		const { url } = event
		const withLocale = urlWithLocale(url, event.cookies)
		if (withLocale !== url) {
			throw redirect(302, withLocale)
		}
		event.locals.locale = localeFromURL(withLocale)
		if (event.cookies.get('locale') !== event.locals.locale) {
			event.cookies.set('locale', event.locals.locale, { path: '/' })
		}
		event.locals.redirect = appRedirect
		const session = await event.locals.getSession()
		event.locals.session = session
		console.log('######')
		console.log('Have session:', session !== null)
		console.log('Session:', session)
		event.locals.db = getEnhancedPrisma(session?.user ? session.user.id : undefined)

		const urlWithoutLocale = pathNameWithoutLocale(url)
		const isProtectedRoute = urlWithoutLocale.startsWith('/dashboard')
		console.log(
			'REQ. Method:',
			event.request.method,
			event.url.pathname,
			'isProtectedRoute:',
			isProtectedRoute,
			'Have session:',
			session !== null
		)

		if (isProtectedRoute && !session) {
			throw event.locals.redirect(302, '/signin', event.locals.locale)
		}

		const handleNoProfile = () => {
			console.log('User needs to create his profile')
			if (
				!urlWithoutLocale.startsWith('/signout') &&
				!urlWithoutLocale.startsWith('/verifyRequest')
			)
				throw redirect(302, '/signin/setup-profile')
		}

		if (session) {
			try {
				const profile = await event.locals.db.profile.findUnique({
					where: { id: session.user.id }
				})
				if (profile) {
					event.locals.user = profile
					if (profile.preferedLanguage !== event.locals.locale) {
						await safeDBCall(
							event.locals.db.profile.update({
								where: { id: profile.id },
								data: { preferedLanguage: event.locals.locale }
							})
						)
					}
				}
			} catch (e) {
				if (e instanceof Prisma.PrismaClientKnownRequestError) {
					if (e.code === 'P2025' && !urlWithoutLocale.startsWith('/signin/setup-profile'))
						handleNoProfile()
					else {
						console.log('Cannot get user profile from db')
						console.log(e)
					}
				}
			}
			if (!event.locals.user && !urlWithoutLocale.startsWith('/signin/setup-profile')) {
				handleNoProfile()
			}
		}

		return await resolve(event)
	}
)
