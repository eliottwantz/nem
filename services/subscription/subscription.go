package subscription

import (
	"context"

	"nem/api/rpc"
	"nem/db"

	"github.com/charmbracelet/log"
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
