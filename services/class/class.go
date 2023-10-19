package class

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/httpmw"
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
		logger: log.WithPrefix("ClassService"),
	}
}

func (s *Service) ListLanguages(ctx context.Context) ([]string, error) {
	res, err := db.Pg.ListLanguages(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]string, 0, len(res))
	for _, l := range res {
		ret = append(ret, l.Language)
	}

	return ret, nil
}

func (s *Service) ListTopics(ctx context.Context) ([]string, error) {
	res, err := db.Pg.ListTopics(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]string, 0, len(res))
	for _, t := range res {
		ret = append(ret, t.Topic)
	}

	return ret, nil
}

func (s *Service) ShowClassDetails(ctx context.Context, classId string) (*rpc.ClassDetails, error) {
	cID, err := uuid.Parse(classId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	dbClass, err := db.Pg.FindClass(ctx, cID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	dbUsers, err := db.Pg.ListStudentsInClass(ctx, cID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	teacher, err := db.Pg.FindTeacherByID(ctx, dbClass.TeacherID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	rpcUsers := make([]*rpc.User, 0, len(dbUsers))
	for _, u := range dbUsers {
		rpcUsers = append(rpcUsers, rpc.FromDbUser(u))
	}

	return &rpc.ClassDetails{
		Class: &rpc.Class{
			Id:         dbClass.ID.String(),
			Name:       dbClass.Name,
			Language:   dbClass.Language,
			HasStarted: dbClass.HasStarted,
			Topic:      dbClass.Topic,
			TeacherId:  dbClass.TeacherID.String(),
			IsPrivate:  dbClass.IsPrivate,
			StartAt:    dbClass.StartAt,
			EndAt:      dbClass.EndAt,
			CreatedAt:  dbClass.CreatedAt,
		},
		Users:   rpcUsers,
		Teacher: rpc.FromDbTeacher(teacher),
	}, nil
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

	tID, err := uuid.Parse(req.TimeSlotId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeSlotId param"))
	}

	timeSlot, err := tx.FindTimeSlot(ctx, tID)
	if err != nil {
		s.logger.Warn("failed to find time slot", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrorCreateJoinClass)
	}

	uID := httpmw.ContextUID(ctx)
	{
		exists, err := tx.FindClassByTimeslot(ctx, timeSlot.ID)
		if err == nil {
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
			if exists.IsPrivate {
				s.logger.Warn("class is private", "error", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("class is private"))
			}
			err = tx.AddStudentToClass(ctx, db.AddStudentToClassParams{
				ClassID:   exists.ID,
				StudentID: uID,
			})
			if err != nil {
				s.logger.Warn("failed to add student to class", "error", err)
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
		TimeSlotID: tID,
		IsPrivate:  req.IsPrivate,
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
