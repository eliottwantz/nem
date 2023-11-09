import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
	const eliott = await prisma.user.create({
		data: {
			email: 'teacher@nem.com',
			emailVerified: new Date()
		}
	})
	const margaux = await prisma.user.create({
		data: {
			email: 'teacher2@nem.com',
			emailVerified: new Date()
		}
	})
	const a = await prisma.user.create({
		data: {
			email: 'a@nem.com',
			emailVerified: new Date()
		}
	})
	const b = await prisma.user.create({
		data: {
			email: 'b@nem.com',
			emailVerified: new Date()
		}
	})
	await prisma.profile.createMany({
		data: [
			{
				id: eliott.id,
				firstName: 'Eliott',
				lastName: 'General',
				role: 'teacher',
				preferedLanguage: 'fr'
			},
			{
				id: margaux.id,
				firstName: 'Margaux',
				lastName: 'Preply',
				role: 'teacher',
				preferedLanguage: 'fr'
			},
			{
				id: a.id,
				firstName: 'A',
				lastName: 'A',
				role: 'student',
				preferedLanguage: 'en'
			},
			{
				id: b.id,
				firstName: 'B',
				lastName: 'B',
				role: 'student',
				preferedLanguage: 'en'
			}
		]
	})
	await prisma.student.createMany({
		data: [
			{
				id: a.id
			},
			{
				id: b.id
			}
		]
	})
	await prisma.language.createMany({
		data: [
			{
				language: 'French'
			},
			{
				language: 'English'
			},
			{
				language: 'Arabic'
			}
		]
	})
	await prisma.spokenLanguage.createMany({
		data: [
			{
				languageId: 'French',
				proficiency: 'native'
			},
			{
				languageId: 'French',
				proficiency: 'a1'
			},
			{
				languageId: 'French',
				proficiency: 'a2'
			},
			{
				languageId: 'French',
				proficiency: 'b1'
			},
			{
				languageId: 'French',
				proficiency: 'b2'
			},
			{
				languageId: 'French',
				proficiency: 'c1'
			},
			{
				languageId: 'French',
				proficiency: 'c2'
			},
			{
				languageId: 'English',
				proficiency: 'native'
			},
			{
				languageId: 'English',
				proficiency: 'a1'
			},
			{
				languageId: 'English',
				proficiency: 'a2'
			},
			{
				languageId: 'English',
				proficiency: 'b1'
			},
			{
				languageId: 'English',
				proficiency: 'b2'
			},
			{
				languageId: 'English',
				proficiency: 'c1'
			},
			{
				languageId: 'English',
				proficiency: 'c2'
			}
		]
	})
	await prisma.topic.createMany({
		data: [
			{
				topic: 'French'
			},
			{
				topic: 'English'
			},
			{
				topic: 'Mathematics'
			},
			{
				topic: 'Philosophy'
			},
			{
				topic: 'Biology'
			},
			{
				topic: 'Physics'
			},
			{
				topic: 'Chemistry'
			},
			{
				topic: 'History'
			},
			{
				topic: 'Geography'
			}
		]
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
	await prisma.teacher.create({
		include: {
			spokenLanguages: true
		},
		data: {
			id: eliott.id,
			bio: `Bienvenue à mes cours de langue en ligne ! Je suis passionné(e) par l''enseignement des langues et je suis ravi(e) de vous aider à atteindre vos objectifs linguistiques. Avec une expérience de plusieurs années dans l''enseignement des langues, je suis là pour rendre votre voyage d''apprentissage agréable et efficace.

Mes cours sont conçus pour être interactifs, engageants et adaptés à vos besoins spécifiques. Que vous souhaitiez améliorer votre conversation, renforcer vos compétences en grammaire ou préparer un examen, nous travaillerons ensemble pour atteindre vos objectifs.

En tant qu''instructeur, je m''engage à créer un environnement d''apprentissage positif et inclusif où vous vous sentirez à l''aise pour pratiquer et progresser. Rejoignez-moi dans cette aventure linguistique et découvrez la beauté et la richesse d''une nouvelle langue. Ensemble, nous allons explorer de nouveaux horizons linguistiques !'`,
			hourRate: 32,
			topAgent: true,
			topics: {
				connect: [
					{
						topic: 'French'
					},
					{
						topic: 'Physics'
					}
				]
			},
			spokenLanguages: {
				connect: [
					{
						id: 1
					},
					{
						id: 9
					}
				]
			}
		}
	})
	await prisma.teacher.create({
		data: {
			id: margaux.id,
			bio: `Bienvenue à mes cours de langue en ligne ! Je suis passionnée par l'enseignement des langues et je suis ravie de vous aider à atteindre vos objectifs linguistiques. Avec une expérience de plusieurs années dans l'enseignement des langues, je suis là pour rendre votre voyage d''apprentissage agréable et efficace.

Mes cours sont conçus pour être interactifs, engageants et adaptés à vos besoins spécifiques. Que vous souhaitiez améliorer votre conversation, renforcer vos compétences en grammaire ou préparer un examen, nous travaillerons ensemble pour atteindre vos objectifs.

En tant que professeure, je m'engage à créer un environnement d'apprentissage positif et inclusif où vous vous sentirez à l'aise pour pratiquer et progresser. Rejoignez-moi dans cette aventure linguistique et découvrez la beauté et la richesse d'une nouvelle langue. Ensemble, nous allons explorer de nouveaux horizons linguistiques !`,
			topAgent: true,
			hourRate: 37,
			topics: {
				connect: [
					{
						topic: 'French'
					},
					{
						topic: 'English'
					},
					{
						topic: 'Chemistry'
					}
				]
			},
			spokenLanguages: {
				connect: [
					{
						id: 1
					},
					{
						id: 10
					}
				]
			}
		}
	})
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
