/** 
 * This file was generated by 'vite-plugin-kit-routes'
 * 
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

/**
 * PAGES
 */
const PAGES = {
  "/": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: '/'}`
  },
  "/about": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/about`
  },
  "/contact": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contact`
  },
  "/dashboard/class/[id]": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/class/${params.id}`
  },
  "/dashboard/messages": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/messages`
  },
  "/dashboard/messages/[id]": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/messages/${params.id}`
  },
  "/dashboard/profile": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile`
  },
  "/dashboard/profile/account": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile/account`
  },
  "/dashboard/profile/balance": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile/balance`
  },
  "/dashboard/student/calendar": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/student/calendar`
  },
  "/dashboard/student/classes": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/student/classes`
  },
  "/dashboard/student/classes/[id]": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/student/classes/${params.id}`
  },
  "/dashboard/teacher/calendar": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/teacher/calendar`
  },
  "/dashboard/teacher/classes": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/teacher/classes`
  },
  "/dashboard/teacher/classes/[id]": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/teacher/classes/${params.id}`
  },
  "/dashboard/teacher/teach": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/teacher/teach`
  },
  "/teachers": (params?: { lang?: (string), topic?: (string), language?: (string) }) => {
    params = params ?? {}
    params.topic = params.topic ?? "English"; 
    params.language = params.language ?? "French"; 
    return `${params?.lang ? `/${params?.lang}`: ''}/teachers${appendSp({ topic: params?.topic, language: params?.language })}`
  },
  "/teachers/[id]": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/teachers/${params.id}`
  },
  "/teachers/[id]/subscribe": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/teachers/${params.id}/subscribe`
  },
  "/top-agent": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/top-agent`
  },
  "/users/[id]": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/users/${params.id}`
  },
  "/error": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/error`
  },
  "/signin": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/signin`
  },
  "/signin/setup-profile": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/signin/setup-profile`
  },
  "/signin/setup-profile/student": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/signin/setup-profile/student`
  },
  "/signin/setup-profile/teacher": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/signin/setup-profile/teacher`
  },
  "/signout": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/signout`
  },
  "/verifyRequest": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/verifyRequest`
  }
}

/**
 * SERVERS
 */
const SERVERS = {
  "GET /dashboard/profile/account/reauth": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile/account/reauth`
  },
  "POST /teachers/[id]/subscribe": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/teachers/${params.id}/subscribe`
  },
  "POST /teachers/[id]/take-trial-class": (params: { id: (string | number), lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/teachers/${params.id}/take-trial-class`
  },
  "PUT /api/change-lang": `/api/change-lang`,
  "POST /api/chats": `/api/chats`,
  "POST /api/chats/send/[chatId]": (params: { chatId: (string | number) }) => {
    return `/api/chats/send/${params.chatId}`
  },
  "POST /api/classes/[id]/cancel": (params: { id: (string | number) }) => {
    return `/api/classes/${params.id}/cancel`
  },
  "POST /api/classes/join": `/api/classes/join`,
  "GET /api/messages/[chatId]": (params: { chatId: (string | number), cursor?: (number) }) => {
    return `/api/messages/${params.chatId}${appendSp({ cursor: params?.cursor })}`
  },
  "POST /api/teacher/availabilities": `/api/teacher/availabilities`,
  "PUT /api/teacher/availabilities/[id]": (params: { id: (string | number) }) => {
    return `/api/teacher/availabilities/${params.id}`
  },
  "DELETE /api/teacher/availabilities/[id]": (params: { id: (string | number) }) => {
    return `/api/teacher/availabilities/${params.id}`
  },
  "DELETE /api/teacher/classes/[id]/cancel": (params: { id: (string | number) }) => {
    return `/api/teacher/classes/${params.id}/cancel`
  },
  "PATCH /api/teacher/topics": `/api/teacher/topics`,
  "GET /api/wise/profiles": `/api/wise/profiles`,
  "POST /stripe/webhooks": `/stripe/webhooks`
}

/**
 * ACTIONS
 */
const ACTIONS = {
  "updateAvatar /dashboard/profile": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile?/updateAvatar`
  },
  "deleteAvatar /dashboard/profile": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile?/deleteAvatar`
  },
  "createAccount /dashboard/profile/account": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile/account?/createAccount`
  },
  "cashOut /dashboard/profile/balance": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/profile/balance?/cashOut`
  },
  "newTopic /dashboard/teacher/teach": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/dashboard/teacher/teach?/newTopic`
  },
  "default /signin/setup-profile/student": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/signin/setup-profile/student`
  },
  "default /signin/setup-profile/teacher": (params?: { lang?: (string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/signin/setup-profile/teacher`
  }
}

/**
 * LINKS
 */
const LINKS = {
  
}

/**
 * Append search params to a string
 */
const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''
  const mapping = Object.entries(sp)
    .filter(c => c[1] !== undefined)
    .map(c => [c[0], String(c[1])])

  const formated = new URLSearchParams(mapping).toString()
  if (formated) {
    return `${prefix}${formated}`
  }
  return ''
}

/**
 * get the current search params
 * 
 * Could be use like this:
 * ```
 * route("/cities", { page: 2 }, { ...currentSP() })
 * ```
 */ 
export const currentSp = () => {
  const params = new URLSearchParams(window.location.search)
  const record: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    record[key] = value
  }
  return record
}

// route function helpers
type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
type AllTypes = typeof AllObjs

/**
 * To be used like this: 
 * ```ts
 * import { route } from './ROUTES'
 * 
 * route('site_id', { id: 1 })
 * ```
 */
export function route<T extends FunctionKeys<AllTypes>>(key: T, ...params: FunctionParams<AllTypes[T]>): string
export function route<T extends NonFunctionKeys<AllTypes>>(key: T): string
export function route<T extends keyof AllTypes>(key: T, ...params: any[]): string {
  if (AllObjs[key] as any instanceof Function) {
    const element = (AllObjs as any)[key] as (...args: any[]) => string
    return element(...params)
  } else {
    return AllObjs[key] as string
  }
}

/**
* Add this type as a generic of the vite plugin `kitRoutes<KIT_ROUTES>`.
* 
* Full example:
* ```ts
* import type { KIT_ROUTES } from './ROUTES'
* import { kitRoutes } from 'vite-plugin-kit-routes'
* 
* kitRoutes<KIT_ROUTES>({
*  PAGES: {
*    // here, key of object will be typed!
*  }
* })
* ```
*/
export type KIT_ROUTES = { 
  PAGES: { '/': 'lang', '/about': 'lang', '/contact': 'lang', '/dashboard/class/[id]': 'id' | 'lang', '/dashboard/messages': 'lang', '/dashboard/messages/[id]': 'id' | 'lang', '/dashboard/profile': 'lang', '/dashboard/profile/account': 'lang', '/dashboard/profile/balance': 'lang', '/dashboard/student/calendar': 'lang', '/dashboard/student/classes': 'lang', '/dashboard/student/classes/[id]': 'id' | 'lang', '/dashboard/teacher/calendar': 'lang', '/dashboard/teacher/classes': 'lang', '/dashboard/teacher/classes/[id]': 'id' | 'lang', '/dashboard/teacher/teach': 'lang', '/teachers': 'lang', '/teachers/[id]': 'id' | 'lang', '/teachers/[id]/subscribe': 'id' | 'lang', '/top-agent': 'lang', '/users/[id]': 'id' | 'lang', '/error': 'lang', '/signin': 'lang', '/signin/setup-profile': 'lang', '/signin/setup-profile/student': 'lang', '/signin/setup-profile/teacher': 'lang', '/signout': 'lang', '/verifyRequest': 'lang' }
  SERVERS: { 'GET /dashboard/profile/account/reauth': 'lang', 'POST /teachers/[id]/subscribe': 'id' | 'lang', 'POST /teachers/[id]/take-trial-class': 'id' | 'lang', 'PUT /api/change-lang': never, 'POST /api/chats': never, 'POST /api/chats/send/[chatId]': 'chatId', 'POST /api/classes/[id]/cancel': 'id', 'POST /api/classes/join': never, 'GET /api/messages/[chatId]': 'chatId', 'POST /api/teacher/availabilities': never, 'PUT /api/teacher/availabilities/[id]': 'id', 'DELETE /api/teacher/availabilities/[id]': 'id', 'DELETE /api/teacher/classes/[id]/cancel': 'id', 'PATCH /api/teacher/topics': never, 'GET /api/wise/profiles': never, 'POST /stripe/webhooks': never }
  ACTIONS: { 'updateAvatar /dashboard/profile': 'lang', 'deleteAvatar /dashboard/profile': 'lang', 'createAccount /dashboard/profile/account': 'lang', 'cashOut /dashboard/profile/balance': 'lang', 'newTopic /dashboard/teacher/teach': 'lang', 'default /signin/setup-profile/student': 'lang', 'default /signin/setup-profile/teacher': 'lang' }
  LINKS: Record<string, never>
  Params: { lang: never, id: never, topic: never, language: never, chatId: never, cursor: never }
}
