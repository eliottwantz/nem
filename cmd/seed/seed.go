package main

import (
	"log"

	"nem/db"
	"nem/utils"

	_ "embed"
)

//go:embed seed.sql
var seedSql string

func main() {
	err := utils.LoadEnv()
	if err != nil {
		log.Fatal(err)
	}
	err = db.Seed(seedSql)
	if err != nil {
		log.Fatal(err)
	}
}
