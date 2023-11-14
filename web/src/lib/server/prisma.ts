import { PrismaClient } from '@prisma/client'
import { enhance } from '@zenstackhq/runtime'

export const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error']
})

export function getEnhancedPrisma(userId?: string) {
	return enhance(prisma, { user: userId ? { id: userId } : undefined })
}
