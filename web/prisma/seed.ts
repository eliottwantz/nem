import { PrismaClient, Proficiency } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const languages = ['French', 'English', 'Arabic']
const proficiencies = Object.values(Proficiency)
const topics = [
	'French',
	'English',
	'Arabic',
	'Mathematics',
	'Philosophy',
	'Biology',
	'Physics',
	'Chemistry',
	'History',
	'Geography'
]

async function main() {
	await prisma.language.createMany({
		data: languages.map((l) => ({ language: l }))
	})
	await prisma.topic.createMany({
		data: topics.map((t) => ({ topic: t }))
	})
	await prisma.subscription.createMany({
		data: [
			{
				id: 'prod_Os2YfRsSF6IiOj',
				name: 'Explorer',
				hours: 4
			},
			{
				id: 'prod_OspMRucxW4XnBY',
				name: 'Learner',
				hours: 8
			},
			{
				id: 'prod_OspMsYO3WIdh4Y',
				name: 'Voyager',
				hours: 12
			},
			{
				id: 'prod_OspNodpbmAmmUo',
				name: 'Trailblazer',
				hours: 16
			},
			{
				id: 'prod_OspNG8yO0TLW99',
				name: 'Master',
				hours: 20
			}
		]
	})
	for (let index = 0; index < 100; index++) {
		const firstName = faker.person.firstName()
		const lastName = faker.person.lastName()
		const email = `teacher${index}@nem.com`
		const languageId = languages[Math.floor(Math.random() * languages.length)]
		const proficiency = proficiencies[Math.floor(Math.random() * proficiencies.length)]
		const avatar = faker.image.avatar()
		const topic = topics[Math.floor(Math.random() * topics.length)]
		// Create teachers
		await prisma.user.create({
			data: {
				email,
				profile: {
					create: {
						firstName,
						lastName,
						role: 'teacher',
						avatarUrl: avatar,
						avatarFilePath: avatar,
						birdthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
						teacher: {
							create: {
								bio: faker.lorem.paragraph(),
								hourRate: faker.number.int({ min: 1, max: 60 }),
								rating: faker.number.int({ min: 1, max: 5 }),
								topAgent: faker.datatype.boolean(),
								spokenLanguages: {
									connectOrCreate: [
										{
											where: {
												languageId_proficiency: {
													languageId,
													proficiency
												}
											},
											create: {
												languageId,
												proficiency
											}
										}
									]
								},
								topics: {
									connectOrCreate: [
										{
											where: { topic },
											create: { topic }
										}
									]
								}
							}
						}
					}
				}
			}
		})

		const firstName2 = faker.person.firstName()
		const lastName2 = faker.person.lastName()
		const email2 = `student${index}@nem.com`
		const avatar2 = faker.image.avatar()
		// Create students
		await prisma.user.create({
			data: {
				email: email2,
				profile: {
					create: {
						firstName: firstName2,
						lastName: lastName2,
						role: 'student',
						avatarUrl: avatar2,
						avatarFilePath: avatar2,
						birdthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
						student: { create: {} }
					}
				}
			}
		})
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
