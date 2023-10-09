package db

const (
	TopicEnglish = iota
	TopicFrench
	TopicArabic
	TopicMaths
	TopicPhysics
	TopicChemistry
	TopicBiology
	TopicHistory
	TopicGeography
)

var Topics = []string{
	TopicEnglish:   "English",
	TopicFrench:    "French",
	TopicArabic:    "Arabic",
	TopicMaths:     "Maths",
	TopicPhysics:   "Physics",
	TopicChemistry: "Chemistry",
	TopicBiology:   "Biology",
	TopicHistory:   "History",
	TopicGeography: "Geography",
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

const (
	ProficiencyA1 = iota
	ProficiencyA2
	ProficiencyB1
	ProficiencyB2
	ProficiencyC1
	ProficiencyC2
	Native
)

var Proficiencies = []string{
	ProficiencyA1: "A1",
	ProficiencyA2: "A2",
	ProficiencyB1: "B1",
	ProficiencyB2: "B2",
	ProficiencyC1: "C1",
	ProficiencyC2: "C2",
	Native:        "Native",
}

var ProficienciesMeaning = []string{
	ProficiencyA1: "Beginner",
	ProficiencyA2: "Elementary",
	ProficiencyB1: "Pre-intermediate",
	ProficiencyB2: "Intermediate",
	ProficiencyC1: "Upper-intermediate",
	ProficiencyC2: "Advanced",
	Native:        "Native",
}
