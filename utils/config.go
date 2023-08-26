package utils

import (
	"fmt"

	"github.com/Netflix/go-env"
	"github.com/joho/godotenv"
)

var Cfg Config

type Config struct {
	Host             string `env:"HOST,default=0.0.0.0"`
	Port             string `env:"PORT,default=8080"`
	WebURL           string `env:"WEB_URL,required=true"`
	DatabaseURL      string `env:"DATABASE_URL,required=true"`
	RedisURL         string `env:"REDIS_URL,required=true"`
	TokenSecretKey   string `env:"TOKEN_SECRET_KEY,required=true"`
	SupabaseURL      string `env:"SUPABASE_URL,required=true"`
	SupabaseKey      string `env:"SUPABASE_KEY,required=true"`
	Production       bool   `env:"PRODUCTION,default=false"`
	Migrate          bool   `env:"MIGRATE,default=false"`
	LiveKitApiKey    string `env:"LIVEKIT_API_KEY,required=true"`
	LiveKitApiSecret string `env:"LIVEKIT_API_SECRET,required=true"`
}

func LoadEnv() error {
	if err := godotenv.Load(); err != nil {
		return fmt.Errorf("load .env: %w", err)
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
