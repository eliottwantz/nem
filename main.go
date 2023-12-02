package main

import (
	"context"
	"flag"
	"os"

	"nem/api"
	"nem/api/ws"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
)

func main() {
	flag.Parse()
	if err := setup(); err != nil {
		log.Error("Failed to setup application", "err", err)
		os.Exit(1)
	}
}

func setup() error {
	ctx := context.Background()

	err := utils.LoadEnv()
	if err != nil {
		return err
	}
	utils.InitLogger()

	log.Info("Initializing data sources...")
	err = db.InitDataSources(ctx)
	if err != nil {
		return err
	}

	// Endpoints layer
	log.Info("Creating websocket hub...")
	wsHub := ws.NewHub()
	go wsHub.Run()
	wsService := ws.NewService(wsHub)
	api := api.New(&api.Services{
		WsHub:     wsHub,
		WsService: wsService,
	})

	return api.Start(ctx)
}
