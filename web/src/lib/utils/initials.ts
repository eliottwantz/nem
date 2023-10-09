export function getInitials(firstName: string, lastName: string): string {
	return `${firstName[0]}${lastName[0]}`
}

export function getPublicName(firstname: string, lastname: string): string {
	return `${firstname.at(0)?.toUpperCase()}${firstname.slice(1)} ${lastname
		.at(0)
		?.toUpperCase()}.`
}
