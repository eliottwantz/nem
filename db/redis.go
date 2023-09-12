package db

import (
	"context"
	"fmt"
	"time"

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

type SessionUser struct {
	ID               string    `json:"id"`
	UserID           string    `json:"user_id"`
	Email            string    `json:"email"`
	EmailVerified    bool      `json:"email_verified"`
	FirstName        string    `json:"first_name"`
	LastName         string    `json:"last_name"`
	Role             Role      `json:"role"`
	PreferedLanguage string    `json:"prefered_language"`
	AvatarFilePath   string    `json:"avatar_file_path"`
	AvatarUrl        string    `json:"avatar_url"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
