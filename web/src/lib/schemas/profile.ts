import { z } from 'zod'

export const availableLanguages = ['English', 'French', 'Arabic'] as const
export const proficiencyLevels = ['Native', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export const proficienciesMeaning = {
	A1: 'Beginner',
	A2: 'Elementary',
	B1: 'Pre-intermediate',
	B2: 'Intermediate',
	C1: 'Upper-intermediate',
	C2: 'Advanced',
	Native: 'Native'
} as const

const spokenLanguages = z.array(
	z.object({
		language: z.enum(availableLanguages),
		proficiency: z.enum(proficiencyLevels)
	})
)
export type SpokenLanguages = z.infer<typeof spokenLanguages>

export const createTeacherSchema = z.object({
	firstName: z.string().nonempty({ message: 'First name is required' }),
	lastName: z.string().nonempty({ message: 'Last name is required' }),
	role: z.string().nonempty({ message: 'Role is required' }),
	preferedLanguage: z.string(),
	spokenLanguages,
	bio: z.string().nonempty({ message: 'Bio is required' }),
	hourRate: z
		.number({ invalid_type_error: 'Hour rate must be a number' })
		.positive({ message: 'Hour rate is required' })
})

export const createStudentSchema = z.object({
	firstName: z.string().nonempty({ message: 'First name is required' }),
	lastName: z.string().nonempty({ message: 'Last name is required' }),
	role: z.string().nonempty({ message: 'Role is required' }),
	preferedLanguage: z.string()
})
