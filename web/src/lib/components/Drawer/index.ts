import type { Profile } from '@prisma/client'

export const drawerStoreIds = {
	sidebar: 'sidebar',
	chat: 'chat'
} as const

export type DrawerMetaChat = {
	chatId?: string
	recepient: Profile
}
