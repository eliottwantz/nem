package db

const (
	TopicLanguage = iota
	TopicPrivate
	TopicMaths
	TopicPhysics
	TopicChemistry
	TopicBiology
	TopicHistory
	TopicGeography
	TopicOther
)

var Topics = []string{
	TopicLanguage:  "Language",
	TopicPrivate:   "Private",
	TopicMaths:     "Maths",
	TopicPhysics:   "Physics",
	TopicChemistry: "Chemistry",
	TopicBiology:   "Biology",
	TopicHistory:   "History",
	TopicGeography: "Geography",
	TopicOther:     "Other",
}

const (
	LanguageEnglish = iota
	LanguageFrench
	LanguageArabic
)

var Languages = []string{
	LanguageEnglish: "English",
	LanguageFrench:  "French",
	LanguageArabic:  "Arabic",
}
