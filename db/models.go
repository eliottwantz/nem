// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0

package db

import (
	"database/sql"
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleStudent Role = "student"
	RoleTeacher Role = "teacher"
	RoleAdmin   Role = "admin"
)

func (e *Role) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = Role(s)
	case string:
		*e = Role(s)
	default:
		return fmt.Errorf("unsupported scan type for Role: %T", src)
	}
	return nil
}

type NullRole struct {
	Role  Role
	Valid bool // Valid is true if Role is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullRole) Scan(value interface{}) error {
	if value == nil {
		ns.Role, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.Role.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullRole) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.Role), nil
}

func (e Role) Valid() bool {
	switch e {
	case RoleStudent,
		RoleTeacher,
		RoleAdmin:
		return true
	}
	return false
}

func AllRoleValues() []Role {
	return []Role{
		RoleStudent,
		RoleTeacher,
		RoleAdmin,
	}
}

type Class struct {
	ID        uuid.UUID
	Name      string
	LearnID   int32
	StartAt   time.Time
	EndAt     time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Learn struct {
	ID       int32
	Language string
	Topic    string
}

type Message struct {
	ID        uuid.UUID
	Text      string
	UserID    uuid.UUID
	ClassID   uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
}

type User struct {
	ID               uuid.UUID
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
	AvatarFilePath   sql.NullString
	AvatarUrl        sql.NullString
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type UserClass struct {
	UserID    uuid.UUID
	ClassID   uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserLearn struct {
	UserID    uuid.UUID
	LearnID   int32
	CreatedAt time.Time
	UpdatedAt time.Time
}
