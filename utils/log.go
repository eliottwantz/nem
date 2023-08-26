package utils

import (
	"os"
	"time"

	"github.com/charmbracelet/log"
)

func newBaseLogger() *log.Logger {
	logger := log.NewWithOptions(os.Stdout, log.Options{
		TimeFormat:      time.Kitchen,
		Level:           log.DebugLevel,
		ReportTimestamp: true,
		ReportCaller:    true,
		Formatter:       log.TextFormatter,
	})
	if IsProd() {
		logger = log.NewWithOptions(os.Stdout, log.Options{
			TimeFormat:      time.RFC3339,
			Level:           log.InfoLevel,
			ReportTimestamp: true,
			ReportCaller:    true,
			Formatter:       log.JSONFormatter,
		})
	}
	return logger
}

// New creates a new logger using the default configuration.
func InitLogger() {
	log.SetDefault(newBaseLogger())
}
