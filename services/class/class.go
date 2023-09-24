package class

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
	"github.com/livekit/protocol/auth"
	"golang.org/x/exp/slices"
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
	return db.Languages, nil
}

func (s *Service) ListTopics(ctx context.Context) ([]string, error) {
	return db.Topics, nil
}

func (s *Service) ListClasses(ctx context.Context) ([]*rpc.Class, error) {
	res, err := db.Pg.ListClasses(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Class, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Class{
			Id:        c.ID,
			Name:      c.Name,
			TeacherId: c.TeacherID,
			IsPrivate: c.IsPrivate,
			Language:  c.Language,
			Topic:     c.Topic,
			StartAt:   c.StartAt,
			EndAt:     c.EndAt,
			CreatedAt: c.CreatedAt,
		})
	}

	return ret, nil
}

func (s *Service) ListAvailableLearns(ctx context.Context) ([]*rpc.Learn, error) {
	res, err := db.Pg.ListAvailableLearns(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Learn, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Learn{
			Id:       c.ID,
			Language: c.Language,
			Topic:    c.Topic,
		})
	}

	return ret, nil
}

func (s *Service) ShowClassDetails(ctx context.Context, classId string) (*rpc.ClassDetails, error) {
	if classId == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	dbClass, err := tx.FindClass(ctx, classId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	dbUsers, err := tx.ListUsersInClass(ctx, classId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	rpcUsers := make([]*rpc.User, 0, len(dbUsers))
	for _, u := range dbUsers {
		rpcUsers = append(rpcUsers, rpc.FromDbUser(u))
	}

	return &rpc.ClassDetails{
		Class: &rpc.Class{
			Id:        dbClass.ID,
			Name:      dbClass.Name,
			Language:  dbClass.Language,
			Topic:     dbClass.Topic,
			TeacherId: dbClass.TeacherID,
			IsPrivate: dbClass.IsPrivate,
			StartAt:   dbClass.StartAt,
			EndAt:     dbClass.EndAt,
			CreatedAt: dbClass.CreatedAt,
		},
		Users: rpcUsers,
	}, nil
}

func (s *Service) GetJoinToken(ctx context.Context, roomId string) (string, error) {
	at := auth.NewAccessToken(utils.Cfg.LiveKitApiKey, utils.Cfg.LiveKitApiSecret)
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     roomId,
	}
	at.AddGrant(grant).
		SetIdentity(httpmw.ContextSessionUserID(ctx)).
		SetValidFor(time.Hour)

	return at.ToJWT()
}

func (s *Service) ListTeachersForLearn(ctx context.Context, lang string, topic string) ([]*rpc.User, error) {
	if lang == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("lang is empty"))
	}
	if topic == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("topic is empty"))
	}
	teachers, err := db.Pg.ListTeachersForLearn(ctx, db.ListTeachersForLearnParams{
		Language: lang,
		Topic:    topic,
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.User, 0, len(teachers))
	for _, t := range teachers {
		ret = append(ret, rpc.FromDbUser(t))
	}

	return ret, nil
}

func (s *Service) ListTeacherAvailabilities(ctx context.Context, teacherId string) ([]*rpc.TimeSlot, error) {
	if teacherId == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("teacherId is empty"))
	}

	timeSlots, err := db.Pg.ListTeachersAvailableTimeSlots(ctx, teacherId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	userClasses, err := db.Pg.ListClassesOfUser(ctx, httpmw.ContextSessionUserID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	userClassesTimeSlots := make([]string, 0, len(userClasses))
	for _, c := range userClasses {
		userClassesTimeSlots = append(userClassesTimeSlots, c.TimeSlotID)
	}

	now := time.Now()
	ret := make([]*rpc.TimeSlot, 0, len(timeSlots))
	for _, t := range timeSlots {
		if slices.Contains(userClassesTimeSlots, t.ID) {
			continue
		}
		if t.NumUsers >= 4 {
			continue
		}
		if t.StartAt.Before(now) || t.EndAt.Before(now) {
			continue
		}
		ret = append(ret, &rpc.TimeSlot{
			Id:        t.ID,
			TeacherId: t.TeacherID,
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
	}

	return ret, nil
}

func (s *Service) CreateOrJoinClass(ctx context.Context, req *rpc.CreateClassRequest) (*rpc.Class, error) {
	err := req.Validate()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	if req.TimeSlotId == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeSlotId param"))
	}

	timeSlot, err := tx.FindTimeSlot(ctx, req.TimeSlotId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	uID := httpmw.ContextSessionUserID(ctx)

	{
		exists, err := tx.FindClassByTeacherAndTime(ctx, db.FindClassByTeacherAndTimeParams{
			TeacherID: timeSlot.TeacherID,
			StartAt:   timeSlot.StartAt,
			EndAt:     timeSlot.EndAt,
		})
		if err == nil {
			// Add user to this class if there if less than 4 students in the class and not private
			users, err := tx.ListUsersInClass(ctx, exists.ID)
			if err != nil {
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
			}
			if len(users) >= 4 {
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("class is full"))
			}
			if exists.IsPrivate {
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("class is private"))
			}
			err = tx.AddUserToClass(ctx, db.AddUserToClassParams{
				ClassID: exists.ID,
				UserID:  uID,
			})
			if err != nil {
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
			}
			return &rpc.Class{
				Id:        exists.ID,
				TeacherId: timeSlot.TeacherID,
				IsPrivate: exists.IsPrivate,
				Name:      exists.Name,
				Language:  exists.Language,
				Topic:     exists.Topic,
				StartAt:   timeSlot.StartAt,
				EndAt:     timeSlot.EndAt,
				CreatedAt: exists.CreatedAt,
			}, nil
		} else if err != sql.ErrNoRows {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
	}

	dbClass, err := tx.CreateClass(ctx, db.CreateClassParams{
		Name:       req.Name,
		LearnID:    req.LearnId,
		TimeSlotID: req.TimeSlotId,
		IsPrivate:  req.IsPrivate,
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	learnInfo, err := tx.FindLearn(ctx, req.LearnId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.AddUserToClass(ctx, db.AddUserToClassParams{
		ClassID: dbClass.ID,
		UserID:  uID,
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return &rpc.Class{
		Id:        dbClass.ID,
		TeacherId: timeSlot.TeacherID,
		IsPrivate: dbClass.IsPrivate,
		Name:      dbClass.Name,
		Language:  learnInfo.Language,
		Topic:     learnInfo.Topic,
		StartAt:   timeSlot.StartAt,
		EndAt:     timeSlot.EndAt,
		CreatedAt: dbClass.CreatedAt,
	}, nil
}
