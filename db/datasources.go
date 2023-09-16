package db

import (
	"context"
	"database/sql"
	"fmt"
	"runtime"

	"nem/utils"

	"github.com/charmbracelet/log"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var (
	Pg    *pgdb
	Redis *redis.Client
)

// InitDataSources establishes connections to fields in DataSources
func InitDataSources(ctx context.Context) error {
	log.Info("Connecting to Postgres")
	sqldb, err := sql.Open("postgres", utils.Cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("error connecting to the database: %w", err)
	}
	err = sqldb.Ping()
	if err != nil {
		return fmt.Errorf("error connecting to postgres: %w", err)
	}

	maxOpenConns := 4 * runtime.GOMAXPROCS(0)
	sqldb.SetMaxOpenConns(maxOpenConns)
	sqldb.SetMaxIdleConns(maxOpenConns)

	Pg = NewPG(sqldb)

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
	log.Info("Closing Postgres connection")
	if err := Pg.db.Close(); err != nil {
		return fmt.Errorf("error closing Postgres Client: %w", err)
	}

	return nil
}
