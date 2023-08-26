package user

import "errors"

var (
	ErrGet            = errors.New("could not get user. please try again later")
	ErrNotFound       = errors.New("user not found")
	ErrUpdate         = errors.New("could not update user. please try again later")
	ErrPasswordChange  = errors.New("could not change password. please try again later")
	ErrDelete         = errors.New("could not delete user. please try again later")
)
