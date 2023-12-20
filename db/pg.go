package db

import (
	"context"
	"fmt"

	"github.com/charmbracelet/log"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client

// InitDataSources establishes connections to fields in DataSources
func InitDataSources(ctx context.Context) error {
	var err error
	Redis, err = NewRedis(ctx)
	if err != nil {
		return err
	}

	return nil
}

// CloseDataSources to be used in graceful server shutdown
func CloseDataSources() error {
	log.Info("Closing Redis connection")
	if err := Redis.Close(); err != nil {
		return fmt.Errorf("error closing Redis Client: %w", err)
	}

	return nil
}
