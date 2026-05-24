package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/thekripaverse/student-analyzer-backend/auth"
	"github.com/thekripaverse/student-analyzer-backend/config"
	"github.com/thekripaverse/student-analyzer-backend/models"
	"github.com/thekripaverse/student-analyzer-backend/routes"
)

func main() {
	// 1. Load configuration (reads .env exactly once via sync.Once)
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	log.Printf("Environment: %s", cfg.Environment)

	// 2. Connect to MongoDB at startup — fail fast if unreachable.
	//    This ensures ALL subsequent requests reuse the same connection pool
	//    instead of opening a new TCP connection per request.
	if err := models.InitDB(cfg.MongoURI); err != nil {
		log.Fatalf("Cannot connect to MongoDB: %v\n\n"+
			"Common fixes:\n"+
			"  1. Add your IP to MongoDB Atlas → Network Access → Add IP Address\n"+
			"  2. Check your MONGO_URI in the .env file\n"+
			"  3. Ensure outbound port 27017 is not blocked by a firewall or VPN\n", err)
	}
	defer models.DisconnectDB()

	// 3. Initialize JWT signing with the configured secret.
	auth.Initialize(cfg)

	// 4. Build the Gorilla-Mux router.
	router := routes.SetupRouter(cfg)

	// 5. Wrap router with CORS middleware so the React frontend on :3000 can call us.
	corsHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		router.ServeHTTP(w, r)
	})

	// 6. Configure the HTTP server with sensible timeouts.
	srv := &http.Server{
		Addr:           ":" + cfg.ServerPort,
		Handler:        corsHandler,
		ReadTimeout:    30 * time.Second,
		WriteTimeout:   30 * time.Second,
		IdleTimeout:    120 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	// 7. Start the server in a goroutine so we can handle shutdown signals below.
	go func() {
		log.Printf("Server listening on :%s", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// 8. Block until SIGINT / SIGTERM (Ctrl+C or kill).
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server gracefully...")

	// 9. Give in-flight requests 10 seconds to finish before forcing shutdown.
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server stopped cleanly.")
}