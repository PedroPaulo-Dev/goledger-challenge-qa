package routes

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/goledger/qa-test-api/config"
	"github.com/goledger/qa-test-api/handlers"
	"github.com/goledger/qa-test-api/middleware"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRouter builds and returns the Gin router with all routes registered.
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// ── CORS ──────────────────────────────────────────────────────────────────
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{config.GetCORSOrigin()},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ── Docs ──────────────────────────────────────────────────────────────────
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/docs/index.html")
	})
	r.StaticFile("/swagger.yaml", "./docs/swagger.yaml")
	swaggerURL := ginSwagger.URL("/swagger.yaml")
	r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerfiles.Handler, swaggerURL))

	// ── Public routes ─────────────────────────────────────────────────────────
	auth := r.Group("/auth")
	{
		auth.POST("/login", handlers.Login)
		auth.POST("/register", handlers.Register)
	}

	// BUG-003: DELETE /books is registered outside the authenticated group,
	// so callers can delete books without a valid token.
	r.DELETE("/books", handlers.DeleteBook)

	// ── Protected routes (JWT required) ───────────────────────────────────────
	api := r.Group("/")
	api.Use(middleware.AuthRequired())
	{
		api.GET("/me", handlers.GetProfile)

		api.GET("/books", handlers.GetBooks)
		api.POST("/books", handlers.CreateBook)
		api.PUT("/books/tenant", handlers.UpdateBookTenant)

		api.POST("/persons", handlers.CreatePerson)

		api.POST("/libraries", handlers.CreateLibrary)
		api.GET("/libraries/:name/books", handlers.GetLibraryBookCount)
	}

	return r
}
