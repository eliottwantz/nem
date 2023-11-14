export function getInitials<T extends { firstName: string; lastName: string }>(obj: T): string {
	return `${obj.firstName.at(0)}${obj.lastName.at(0)}`
}

export function getPublicName<T extends { firstName: string; lastName: string }>(obj: T): string {
	return `${obj.firstName.at(0)?.toUpperCase()}${obj.firstName.slice(1)} ${obj.lastName
		.at(0)
		?.toUpperCase()}.`
}
