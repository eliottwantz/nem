package rpc

import (
	validation "github.com/go-ozzo/ozzo-validation"
)

func (r CreateUserRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.FirstName, validation.Required),
		validation.Field(&r.LastName, validation.Required),
		validation.Field(&r.PreferedLanguage, validation.Required),
	)
}

func (r AdminCreateClassRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.UserIDs, validation.Required),
		validation.Field(&r.Name, validation.Required),
		validation.Field(&r.LearnId, validation.Required),
		validation.Field(&r.TimeSlotId, validation.Required),
	)
}

func (r CreateClassRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.UserIDs, validation.Required),
		validation.Field(&r.Name, validation.Required),
		validation.Field(&r.LearnId, validation.Required),
		validation.Field(&r.TimeSlotId, validation.Required),
	)
}
