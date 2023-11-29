const re =
	/[\p{Basic_Emoji}\p{Emoji_Keycap_Sequence}\p{RGI_Emoji_Modifier_Sequence}\p{RGI_Emoji_Flag_Sequence}\p{RGI_Emoji_Tag_Sequence}\p{RGI_Emoji_ZWJ_Sequence}\p{RGI_Emoji}]/gv

export function isEmoji(text: string): boolean {
	return re.test(text)
}

export function matchEmojis(text: string): RegExpMatchArray[] {
	return [...text.matchAll(re)]
}
