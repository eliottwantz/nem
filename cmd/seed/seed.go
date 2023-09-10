package main

import (
	"log"

	"nem/db"

	_ "embed"
)

//go:embed seed.sql
var seedSql string

func main() {
	err := db.Seed(seedSql)
	if err != nil {
		log.Fatal(err)
	}
}
