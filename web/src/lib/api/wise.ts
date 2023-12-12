import { WISE_API_KEY } from '$env/static/private'
import { AppError } from '$lib/utils/error'

export type Balance = {
	id: number
	currency: string
	type: string
	name: any
	icon: any
	investmentState: string
	amount: Amount
	reservedAmount: ReservedAmount
	cashAmount: CashAmount
	totalWorth: TotalWorth
	creationTime: string
	modificationTime: string
	visible: boolean
}

export type Amount = {
	value: number
	currency: string
}

export type ReservedAmount = {
	value: number
	currency: string
}

export type CashAmount = {
	value: number
	currency: string
}

export type TotalWorth = {
	value: number
	currency: string
}

export type Profile =
	| ({ type: 'PERSONAL' } & PersonalProfile)
	| ({ type: 'BUSINESS' } & BusinessProfile)

export type PersonalProfile = {
	type: 'PERSONAL'
	id: number
	userId: number
	address: Address
	email: string
	createdAt: string
	updatedAt: string
	creatorClientId: string
	obfuscated: boolean
	currentState: string
	firstName: string
	lastName: string
	dateOfBirth: string
	phoneNumber: string
	secondaryAddresses: string[]
	fullName: string
}

export interface BusinessProfile {
	type: 'BUSINESS'
	id: number
	userId: number
	address: Address
	email: string
	createdAt: string
	updatedAt: string
	creatorClientId: string
	obfuscated: boolean
	currentState: string
	businessName: string
	registrationNumber: string
	descriptionOfBusiness: string
	webpage: string
	companyType: string
	firstLevelCategory: string
	secondLevelCategory: string
	operationalAddresses: string[]
	onboardingFlow: string
	fullName: string
}

export type Address = {
	addressFirstLine: string
	city: string
	countryIso2Code: string
	countryIso3Code: string
	postCode: string
	stateCode: string | null
}

class Wise {
	host = 'https://api.sandbox.transferwise.tech'
	#fetcher: typeof fetch
	constructor(fetcher: typeof fetch) {
		this.#fetcher = fetcher
	}

	#fetch(input: string | URL, init?: RequestInit | undefined) {
		console.log('input', input)
		const url = new URL(input, this.host)
		console.log('url', url.toString())
		init = {
			...init,
			headers: {
				...init?.headers,
				Authorization: 'Bearer ' + WISE_API_KEY
			}
		}
		return this.#fetcher(url, init)
	}

	async listProfiles(): Promise<Profile[] | AppError> {
		try {
			const res = await this.#fetch('/v2/profiles')
			if (!res.ok) {
				return new AppError(await res.text(), res.status)
			}

			return await res.json()
		} catch (e) {
			return new AppError((e as Error).message, 500)
		}
	}

	// async listBalance(profileId: string):
}

export const wise = (fetcher: typeof fetch) => new Wise(fetcher)
