package db

import (
	"fmt"

	"nem/utils"

	"github.com/charmbracelet/log"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

func Migrate() error {
	log.Info("Migrating database schema down then up")
	d, err := iofs.New(fs, "migrations")
	if err != nil {
		return fmt.Errorf("error reading migrations: %w", err)
	}
	m, err := migrate.NewWithSourceInstance("iofs", d, utils.Cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("error initializing migrations: %w", err)
	}
	if err = m.Down(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("error running migrations: %w", err)
	}
	if err = m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("error running migrations: %w", err)
	}

	return nil
}
