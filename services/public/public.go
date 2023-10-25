package public

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/rpc"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

type Service struct {
	logger *log.Logger
}

func NewService() *Service {
	return &Service{
		logger: log.WithPrefix("PublicService"),
	}
}

func (s *Service) CreateOrJoinClass(ctx context.Context, req *rpc.CreateClassRequest) (*rpc.Class, error) {
	ErrorCreateJoinClass := errors.New("failed to create or join class")
	err := req.Validate()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		s.logger.Warn("failed to start transaction", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}
	defer tx.Rollback()

	timeSlotID, err := uuid.Parse(req.TimeSlotId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeSlotId param"))
	}

	timeSlot, err := tx.FindTimeSlot(ctx, timeSlotID)
	if err != nil {
		s.logger.Warn("failed to find time slot", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
	}

	uID, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty userId param"))
	}
	{
		exists, err := tx.FindClassByTimeslot(ctx, timeSlot.ID)
		if err == nil {
			if exists.IsPrivate {
				s.logger.Warn("class is private", "error", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("class is private"))
			}
			// Add user to this class if there if less than 4 students in the class and not private
			users, err := tx.ListStudentsInClass(ctx, exists.ID)
			if err != nil {
				s.logger.Warn("failed to list students in class", "error", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
			}
			if len(users) >= 4 {
				s.logger.Warn("class is full", "error", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("class is full"))
			}
			err = tx.AddStudentToClass(ctx, db.AddStudentToClassParams{
				ClassID:   exists.ID,
				StudentID: uID,
			})
			if err != nil {
				s.logger.Warn("failed to add student to class", "error", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
			}
			err = tx.AddToStudentsOfTeacher(ctx, db.AddToStudentsOfTeacherParams{
				TeacherID: exists.TeacherID,
				StudentID: uID,
			})
			if err != nil {
				s.logger.Warn("failed to add to students of teacher", "error", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
			}
			err = tx.Commit()
			if err != nil {
				s.logger.Warn("failed to commit transaction", "error", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
			}
			return &rpc.Class{
				Id:         exists.ID.String(),
				TeacherId:  timeSlot.TeacherID.String(),
				IsPrivate:  exists.IsPrivate,
				HasStarted: exists.HasStarted,
				Name:       exists.Name,
				Language:   exists.Language,
				Topic:      exists.Topic,
				StartAt:    timeSlot.StartAt,
				EndAt:      timeSlot.EndAt,
				CreatedAt:  exists.CreatedAt,
			}, nil
		} else if err != sql.ErrNoRows {
			s.logger.Warn("failed to find class by timeslot", "error", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
		}
	}

	dbClass, err := tx.CreateClass(ctx, db.CreateClassParams{
		Name:       req.Name,
		Language:   req.Language,
		Topic:      req.Topic,
		TimeSlotID: timeSlotID,
		IsPrivate:  req.IsPrivate,
		IsTrial:    req.IsTrial,
	})
	if err != nil {
		s.logger.Warn("failed to create class", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
	}

	err = tx.AddStudentToClass(ctx, db.AddStudentToClassParams{
		ClassID:   dbClass.ID,
		StudentID: uID,
	})
	if err != nil {
		s.logger.Warn("failed to add student to class", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
	}
	err = tx.AddToStudentsOfTeacher(ctx, db.AddToStudentsOfTeacherParams{
		TeacherID: timeSlot.TeacherID,
		StudentID: uID,
	})
	if err != nil {
		s.logger.Warn("failed to add to students of teacher", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
	}

	err = tx.Commit()
	if err != nil {
		s.logger.Warn("failed to commit transaction", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}

	return &rpc.Class{
		Id:         dbClass.ID.String(),
		TeacherId:  timeSlot.TeacherID.String(),
		IsPrivate:  dbClass.IsPrivate,
		HasStarted: dbClass.HasStarted,
		Name:       dbClass.Name,
		Language:   dbClass.Language,
		Topic:      dbClass.Topic,
		StartAt:    timeSlot.StartAt,
		EndAt:      timeSlot.EndAt,
		CreatedAt:  dbClass.CreatedAt,
	}, nil
}

func (s *Service) AddHoursToHoursBank(ctx context.Context, studentId string, teacherId string, hours int32) error {
	tID, err := uuid.Parse(teacherId)
	if err != nil {
		s.logger.Warn("could not parse teacher id", "err", err)
		return rpc.ErrWebrpcBadRequest.WithCause(errors.New("empty teacher id param"))
	}

	sID, err := uuid.Parse(studentId)
	if err != nil {
		s.logger.Warn("could not parse student id", "err", err)
		return rpc.ErrWebrpcBadRequest.WithCause(errors.New("empty studentId id param"))
	}

	err = db.Pg.AddHoursToHoursBank(ctx, db.AddHoursToHoursBankParams{
		StudentID: sID,
		TeacherID: tID,
		Hours:     hours,
	})
	if err != nil {
		s.logger.Warn("could not add hours to hours bank", "err", err)
		return rpc.ErrWebrpcInternalError
	}

	return nil
}
