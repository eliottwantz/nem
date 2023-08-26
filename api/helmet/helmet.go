package helmet

import (
	"fmt"
	"net/http"
)

// Taken from GoFiber https://github.com/gofiber/fiber/blob/master/middleware/helmet/helmet.go

// New creates a new middleware handler
func New(config ...Config) func(next http.Handler) http.Handler {
	// Init config
	cfg := configDefault(config...)

	// Return middleware handler
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Set headers
			if cfg.XSSProtection != "" {
				w.Header().Set("X-XSS-Protection", cfg.XSSProtection)
			}

			if cfg.ContentTypeNosniff != "" {
				w.Header().Set("X-Content-Type-Options", cfg.ContentTypeNosniff)
			}

			if cfg.XFrameOptions != "" {
				w.Header().Set("X-Frame-Options", cfg.XFrameOptions)
			}

			if cfg.CrossOriginEmbedderPolicy != "" {
				w.Header().Set("Cross-Origin-Embedder-Policy", cfg.CrossOriginEmbedderPolicy)
			}

			if cfg.CrossOriginOpenerPolicy != "" {
				w.Header().Set("Cross-Origin-Opener-Policy", cfg.CrossOriginOpenerPolicy)
			}

			if cfg.CrossOriginResourcePolicy != "" {
				w.Header().Set("Cross-Origin-Resource-Policy", cfg.CrossOriginResourcePolicy)
			}

			if cfg.OriginAgentCluster != "" {
				w.Header().Set("Origin-Agent-Cluster", cfg.OriginAgentCluster)
			}

			if cfg.ReferrerPolicy != "" {
				w.Header().Set("Referrer-Policy", cfg.ReferrerPolicy)
			}

			if cfg.XDNSPrefetchControl != "" {
				w.Header().Set("X-DNS-Prefetch-Control", cfg.XDNSPrefetchControl)
			}

			if cfg.XDownloadOptions != "" {
				w.Header().Set("X-Download-Options", cfg.XDownloadOptions)
			}

			if cfg.XPermittedCrossDomain != "" {
				w.Header().Set("X-Permitted-Cross-Domain-Policies", cfg.XPermittedCrossDomain)
			}

			// Handle HSTS headers
			if r.TLS != nil && cfg.HSTSMaxAge != 0 {
				subdomains := ""
				if !cfg.HSTSExcludeSubdomains {
					subdomains = "; includeSubDomains"
				}
				if cfg.HSTSPreloadEnabled {
					subdomains = fmt.Sprintf("%s; preload", subdomains)
				}
				w.Header().Set("Strict-Transport-Security", fmt.Sprintf("max-age=%d%s", cfg.HSTSMaxAge, subdomains))
			}

			// Handle Content-Security-Policy headers
			if cfg.ContentSecurityPolicy != "" {
				if cfg.CSPReportOnly {
					w.Header().Set("Content-Security-Policy-Report-Only", cfg.ContentSecurityPolicy)
				} else {
					w.Header().Set("Content-Security-Policy", cfg.ContentSecurityPolicy)
				}
			}

			// Handle Permissions-Policy headers
			if cfg.PermissionPolicy != "" {
				w.Header().Set("Permissions-Policy", cfg.PermissionPolicy)
			}

			next.ServeHTTP(w, r)
		})
	}
}
