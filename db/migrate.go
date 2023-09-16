package db

import (
	"database/sql"
	"fmt"

	"nem/utils"

	_ "github.com/lib/pq"
)

func Seed(seedSql string) error {
	sqldb, err := sql.Open("postgres", utils.Cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("error connecting to the database: %w", err)
	}
	err = sqldb.Ping()
	if err != nil {
		return fmt.Errorf("error connecting to postgres: %w", err)
	}

	_, err = sqldb.Exec(seedSql)

	return err
}
