// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.22.0
// source: subscription.sql

package db

import (
	"context"
)

const listSubscriptions = `-- name: ListSubscriptions :many
SELECT id, name, hours
FROM subscription
`

func (q *Queries) ListSubscriptions(ctx context.Context) ([]*Subscription, error) {
	rows, err := q.db.QueryContext(ctx, listSubscriptions)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Subscription
	for rows.Next() {
		var i Subscription
		if err := rows.Scan(&i.ID, &i.Name, &i.Hours); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
