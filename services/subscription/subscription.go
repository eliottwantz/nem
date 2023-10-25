package subscription

import (
	"context"
	"errors"

	"nem/api/rpc"
	"nem/db"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

type Service struct {
	logger *log.Logger
}

func NewService() *Service {
	return &Service{
		logger: log.WithPrefix("SubscriptionService"),
	}
}

func (s *Service) ListSubscriptions(ctx context.Context) ([]*rpc.Subscription, error) {
	res, err := db.Pg.ListSubscriptions(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Subscription, 0, len(res))
	for _, s := range res {
		ret = append(ret, &rpc.Subscription{
			Id:    s.ID,
			Name:  s.Name,
			Hours: s.Hours,
		})
	}

	return ret, nil
}

func (s *Service) AddSubscriptionForStudent(ctx context.Context, studentId string, teacherId string, subscriptionId string) error {
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

	err = db.Pg.AddSubscriptionForStudent(ctx, db.AddSubscriptionForStudentParams{
		SubscriptionID: subscriptionId,
		TeacherID:      tID,
		StudentID:      sID,
	})
	if err != nil {
		s.logger.Warn("could not add subscription for student", "err", err)
		return rpc.ErrWebrpcInternalError
	}

	return nil
}
