package db

import (
	"context"
	"database/sql"
	"fmt"
)

type pgdb struct {
	db *sql.DB
	*Queries
}

func NewPG(db *sql.DB) *pgdb {
	return &pgdb{
		db:      db,
		Queries: New(db),
	}
}

type TX struct {
	tx *sql.Tx
	*Queries
}

func (pg *pgdb) NewTx(ctx context.Context) (*TX, error) {
	tx, err := pg.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("error starting transaction: %w", err)
	}

	return &TX{
		tx:      tx,
		Queries: Pg.WithTx(tx),
	}, nil
}

func (tx *TX) Rollback() error {
	return tx.tx.Rollback()
}

func (tx *TX) Commit() error {
	return tx.tx.Commit()
}
