package main

import (
	"log"

	"github.com/goledger/qa-test-api/routes"
)

func main() {
	r := routes.SetupRouter()
	log.Println("QA Test API starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
