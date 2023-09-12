package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"nem/api"
	"nem/api/ws"
	"nem/db"
	"nem/services/admin"
	"nem/services/class"
	"nem/services/message"
	"nem/services/student"
	"nem/services/teacher"
	"nem/services/user"
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

	// SessionService layer
	log.Info("Creating services...")

	userService := user.NewService()
	if err != nil {
		return fmt.Errorf("error creating user service: %w", err)
	}
	adminService := admin.NewService()
	classService := class.NewService()

	// Endpoints layer
	log.Info("Creating websocket hub...")
	wsHub := ws.NewHub(&ws.Config{
		UserService: userService,
		RedisClient: db.Redis,
	})
	go wsHub.Run()
	wsService := ws.NewService(wsHub)
	// webrtcManager := webrtc.NewManager()

	teacherService := teacher.NewService(wsService)
	studentService := student.NewService(wsService)
	messageService := message.NewService(wsService)

	api := api.New(&api.Services{
		AdminService:   adminService,
		UserService:    userService,
		TeacherService: teacherService,
		StudentService: studentService,
		ClassService:   classService,
		MessageService: messageService,
		WsHub:          wsHub,
		WsService:      wsService,
	})

	return api.Start(ctx)
}
