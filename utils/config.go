package utils

import (
	"fmt"
	"os"

	"github.com/Netflix/go-env"
	"github.com/joho/godotenv"
)

var Cfg Config

type Config struct {
	Host       string `env:"HOST,default=0.0.0.0"`
	Port       string `env:"PORT,default=8080"`
	Production bool   `env:"PRODUCTION,default=false"`
	RedisURL   string `env:"REDIS_URL,required=true"`
}

func LoadEnv() error {
	prod := os.Getenv("PRODUCTION")
	if prod == "" {
		return fmt.Errorf("environment variable PRODUCTION is not set")
	}
	if prod == "false" {
		if err := godotenv.Load(); err != nil {
			return fmt.Errorf("load .env: %w", err)
		}
	}

	if _, err := env.UnmarshalFromEnviron(&Cfg); err != nil {
		return fmt.Errorf("parse env: %w", err)
	}

	return nil
}

func IsProd() bool {
	return Cfg.Production
}

func IsDev() bool {
	return !IsProd()
}

func HTTPAddr() string {
	return fmt.Sprintf("%s:%s", Cfg.Host, Cfg.Port)
}
