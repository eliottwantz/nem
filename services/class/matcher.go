package class

// I want to create a matching algorithm that will create a course with a minimum of
// 1 student and a maximum of 3 students, with 1 teacher. They all must be learning the same
// language and topic.

type Matcher struct{}

func NewMatcher() *Matcher {
	return &Matcher{}
}
