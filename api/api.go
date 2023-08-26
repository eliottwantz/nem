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
	"nem/api/httpmw"
	"nem/api/rpc"
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

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/go-chi/jwtauth/v5"
	"github.com/jwalton/gchalk"
	"github.com/markbates/goth/gothic"
	"golang.org/x/mod/modfile"
)

type Api struct {
	http *http.Server

	r chi.Router

	adminService   *admin.Service
	userService    *user.Service
	teacherService *teacher.Service
	studentService *student.Service
	classService   *class.Service
	messageService *message.Service
	wsHub          *ws.Hub
	wsService      *ws.Service
	jwauth         *jwtauth.JWTAuth
}

type Services struct {
	AdminService   *admin.Service
	UserService    *user.Service
	TeacherService *teacher.Service
	StudentService *student.Service
	ClassService   *class.Service
	MessageService *message.Service
	WsHub          *ws.Hub
	WsService      *ws.Service
	JWTAuth        *jwtauth.JWTAuth
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

		r:              r,
		adminService:   services.AdminService,
		userService:    services.UserService,
		teacherService: services.TeacherService,
		studentService: services.StudentService,
		classService:   services.ClassService,
		messageService: services.MessageService,
		wsHub:          services.WsHub,
		wsService:      services.WsService,
		jwauth:         services.JWTAuth,
	}

	api.routes()
	if utils.IsDev() {
		printRoutes(api.r)
	}

	return api
}

func (api *Api) routes() {
	handlers := struct {
		userService    rpc.WebRPCServer
		authService    rpc.WebRPCServer
		adminService   rpc.WebRPCServer
		classService   rpc.WebRPCServer
		teacherService rpc.WebRPCServer
		studentService rpc.WebRPCServer
		messageService rpc.WebRPCServer
	}{
		userService:    rpc.NewUserServiceAPIServer(api.userService),
		adminService:   rpc.NewAdminServiceAPIServer(api.adminService),
		classService:   rpc.NewClassServiceAPIServer(api.classService),
		teacherService: rpc.NewTeacherServiceAPIServer(api.teacherService),
		studentService: rpc.NewStudentServiceAPIServer(api.studentService),
		messageService: rpc.NewMessageServiceAPIServer(api.messageService),
	}

	api.r.Group(func(r chi.Router) {
		r.Use(httpmw.WSAuth(api.jwauth))
		r.Get("/ws", api.wsHub.ServeWS)
	})

	api.r.Route("/api", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			// Public routes
			r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "text/plain")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte("OK"))
			})

			// Private routes
			r.Group(func(r chi.Router) {
				r.Use(httpmw.Auth(api.jwauth))

				r.Post("/*", func(w http.ResponseWriter, req *http.Request) {
					req.URL.Path = strings.TrimPrefix(req.URL.Path, "/api")
					service, _ := getServicePath(req.URL.Path)
					switch service {
					case "UserServiceAPI":
						handlers.userService.ServeHTTP(w, req)
					case "ClassServiceAPI":
						handlers.classService.ServeHTTP(w, req)
					case "TeacherServiceAPI":
						handlers.teacherService.ServeHTTP(w, req)
					case "StudentServiceAPI":
						handlers.studentService.ServeHTTP(w, req)
					case "MessageServiceAPI":
						handlers.messageService.ServeHTTP(w, req)
					case "AdminServiceAPI":
						httpmw.OnlyRoles(db.RoleAdmin)(handlers.adminService).ServeHTTP(w, req)
					}
				})
			})
		})
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

func getServicePath(url string) (service, method string) {
	paths := strings.Split(strings.TrimPrefix(url, "/rpc/"), "/")
	service, method = paths[0], paths[1]
	return service, method
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

func withContextAuthProvider(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		provider := chi.URLParam(r, "provider")
		r = r.WithContext(context.WithValue(r.Context(), gothic.ProviderParamKey, provider))
		next.ServeHTTP(w, r)
	})
}
