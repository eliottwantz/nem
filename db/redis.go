package db

import (
	"context"
	"fmt"

	"nem/utils"

	"github.com/charmbracelet/log"

	"github.com/redis/go-redis/v9"
)

func NewRedis(ctx context.Context) (*redis.Client, error) {
	// Initialize redis connection
	opt, err := redis.ParseURL(utils.Cfg.RedisURL)
	if err != nil {
		return nil, fmt.Errorf("error parsing the redis url: %w", err)
	}

	log.Info("Connecting to Redis")
	rds := redis.NewClient(opt)

	// verify redis connection
	_, err = rds.Ping(ctx).Result()

	if err != nil {
		return nil, fmt.Errorf("error connecting to redis: %w", err)
	}

	return rds, nil
}
