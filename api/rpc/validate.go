package rpc

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

func (r CreateStudentRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.FirstName, validation.Required),
		validation.Field(&r.LastName, validation.Required),
		validation.Field(&r.PreferedLanguage, validation.Required),
		validation.Field(&r.Role, validation.Required),
		validation.Field(&r.Email, validation.Required, is.Email),
	)
}

func (r AdminCreateClassRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.UserIDs, validation.Required),
		validation.Field(&r.Name, validation.Required),
		validation.Field(&r.TopicTaughtId, validation.Required),
		validation.Field(&r.TimeSlotId, validation.Required),
	)
}

func (r CreateClassRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Name, validation.Required),
		validation.Field(&r.TopicTaughtId, validation.Required),
		validation.Field(&r.TimeSlotId, validation.Required),
	)
}

func (r AddAvailabilityRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Times, validation.Required),
		validation.Field(&r.StartAt, validation.Required),
		validation.Field(&r.EndAt, validation.Required),
	)
}

func (r EditAvailabilityRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Id, validation.Required),
		validation.Field(&r.Times, validation.Required),
		validation.Field(&r.StartAt, validation.Required),
		validation.Field(&r.EndAt, validation.Required),
	)
}
