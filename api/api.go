package api

import (
	"context"
	"fmt"
	"math"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"reflect"
	"runtime"
	"strings"
	"time"

	"nem/api/helmet"
	"nem/api/ws"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/jwalton/gchalk"
	"golang.org/x/mod/modfile"
)

type Api struct {
	http *http.Server

	r chi.Router

	wsHub     *ws.Hub
	wsService *ws.Service
}

type Services struct {
	WsHub     *ws.Hub
	WsService *ws.Service
}

func New(
	services *Services,
) *Api {
	log.Info("Creating routes...")

	r := chi.NewRouter()

	r.Use(cors.New(cors.Options{
		AllowOriginFunc: func(r *http.Request, origin string) bool {
			return true
		},
		AllowedMethods: []string{
			http.MethodHead,
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
		},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}).Handler,
		helmet.New(),
		middleware.RequestID,
		middleware.RealIP,
		middleware.Logger,
		middleware.Recoverer,
	)
	if utils.IsProd() {
		r.Use(httprate.LimitByIP(20, 10*time.Second))
	}

	api := &Api{
		http: &http.Server{
			Addr:    utils.HTTPAddr(),
			Handler: r,
		},
		r:         r,
		wsHub:     services.WsHub,
		wsService: services.WsService,
	}

	api.routes()
	if utils.IsDev() {
		printRoutes(api.r)
	}

	return api
}

func (api *Api) routes() {
	api.r.Group(func(r chi.Router) {
		r.Get("/ws", api.wsHub.ServeWS)
	})
}

func (api *Api) Start(ctx context.Context) error {
	go func() {
		log.Info("sever started", "addr", "http://"+utils.HTTPAddr())
		if err := api.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("Failed to start the server", "err", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop

	timeout := time.Second * 5
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	// Close data sources
	log.Info("shutting down server", "timeout", timeout)
	if err := db.CloseDataSources(); err != nil {
		log.Error("failed to close data sources", "err", err)
	}
	if err := api.http.Shutdown(ctx); err != nil {
		log.Warn("server was shut down forcefully", "err", err)
	} else {
		log.Info("server gracefully stopped")
	}

	return nil
}

func printRoutes(r chi.Router) {
	walkFunc := func(method string, path string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
		switch method {
		case "GET":
			fmt.Printf("%s", gchalk.Green(fmt.Sprintf("%-8s", method)))
		case "POST", "PUT", "PATCH":
			fmt.Printf("%s", gchalk.Yellow(fmt.Sprintf("%-8s", method)))
		case "DELETE":
			fmt.Printf("%s", gchalk.Red(fmt.Sprintf("%-8s", method)))
		default:
			fmt.Printf("%s", gchalk.White(fmt.Sprintf("%-8s", method)))
		}

		// fmt.Printf("%-25s %60s\n", path, getHandler(getModName(), handler))
		fmt.Printf("%s", strPad(path, 25, "-", "RIGHT"))
		fmt.Printf("%s\n", strPad(getHandler(getModName(), handler), 60, "-", "LEFT"))

		return nil
	}
	if err := chi.Walk(r, walkFunc); err != nil {
		fmt.Print(err)
	}
}

func getHandler(projectName string, handler http.Handler) (funcName string) {
	// https://github.com/go-chi/chi/issues/424
	funcName = runtime.FuncForPC(reflect.ValueOf(handler).Pointer()).Name()
	base := filepath.Base(funcName)

	nameSplit := strings.Split(funcName, "")
	names := nameSplit[len(projectName):]
	path := strings.Join(names, "")

	pathSplit := strings.Split(path, "/")
	path = strings.Join(pathSplit[:len(pathSplit)-1], "/")

	sFull := strings.Split(base, ".")
	s := sFull[len(sFull)-1:]

	s = strings.Split(s[0], "")
	if len(s) <= 4 && len(sFull) >= 3 {
		s = sFull[len(sFull)-3 : len(sFull)-2]
		return "@" + gchalk.Blue(strings.Join(s, ""))
	}
	s = s[:len(s)-3]
	funcName = strings.Join(s, "")

	return path + "@" + gchalk.Blue(funcName)
}

// adapted from https://stackoverflow.com/a/63393712/1033134
func getModName() string {
	goModBytes, err := os.ReadFile("go.mod")
	if err != nil {
		os.Exit(0)
	}
	return modfile.ModulePath(goModBytes)
}

func strPad(input string, padLength int, padString string, padType string) string {
	var output string

	inputLength := len(input)
	padStringLength := len(padString)

	if inputLength >= padLength {
		return input
	}

	repeat := math.Ceil(float64(1) + (float64(padLength-padStringLength))/float64(padStringLength))

	switch padType {
	case "RIGHT":
		output = input + strings.Repeat(padString, int(repeat))
		output = output[:padLength]
	case "LEFT":
		output = strings.Repeat(padString, int(repeat)) + input
		output = output[len(output)-padLength:]
	case "BOTH":
		length := (float64(padLength - inputLength)) / float64(2)
		repeat = math.Ceil(length / float64(padStringLength))
		output = strings.Repeat(padString, int(repeat))[:int(math.Floor(float64(length)))] + input + strings.Repeat(padString, int(repeat))[:int(math.Ceil(float64(length)))]
	}

	return output
}
