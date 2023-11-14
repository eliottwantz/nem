import { Proficiency } from '@prisma/client'
import { z } from 'zod'

export const proficienciesMeaning: Record<Proficiency, string> = {
	a1: 'Beginner',
	a2: 'Elementary',
	b1: 'Pre-intermediate',
	b2: 'Intermediate',
	c1: 'Upper-intermediate',
	c2: 'Advanced',
	native: 'Native'
} as const

const topicsTaught = z
	.string()
	.nonempty({ message: 'Topic is required' })
	.array()
	.min(1, { message: 'At least one topic is required' })
const spokenLanguages = z
	.object({
		id: z.number().positive({ message: 'Language is required' }),
		language: z.string().nonempty({ message: 'Language is required' }),
		proficiency: z.nativeEnum(Proficiency)
	})
	.array()
	.min(1, { message: 'At least one language is required' })
export type SpokenLanguages = z.infer<typeof spokenLanguages>

export const createTeacherSchema = z.object({
	firstName: z.string().nonempty({ message: 'First name is required' }),
	lastName: z.string().nonempty({ message: 'Last name is required' }),
	spokenLanguages,
	topicsTaught,
	bio: z.string().nonempty({ message: 'Bio is required' }),
	hourRate: z
		.number({ invalid_type_error: 'Hour rate must be a number' })
		.positive({ message: 'Hour rate is required' })
})

export const createStudentSchema = z.object({
	firstName: z.string().nonempty({ message: 'First name is required' }),
	lastName: z.string().nonempty({ message: 'Last name is required' })
})
