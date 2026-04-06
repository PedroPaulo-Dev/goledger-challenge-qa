package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/goledger/qa-test-api/ccapi"
	"github.com/goledger/qa-test-api/config"
)

type libraryRequest struct {
	Name string `json:"name" binding:"required"`
}

// CreateLibrary creates a new library via the org3 CCAPI.
func CreateLibrary(c *gin.Context) {
	var req libraryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	params := map[string]interface{}{
		"libraryName": req.Name,
	}

	result, status, err := ccapi.Invoke(config.GetCCAPIOrgURL(), http.MethodPost, "createNewLibrary", params)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach chaincode API"})
		return
	}
	if status != http.StatusOK {
		c.JSON(status, gin.H{"error": string(result)})
		return
	}

	var library map[string]interface{}
	json.Unmarshal(result, &library) //nolint:errcheck
	c.JSON(http.StatusCreated, library)
}

// GetLibraryBookCount returns the number of books in a library.
func GetLibraryBookCount(c *gin.Context) {
	name := c.Param("name")
	params := map[string]interface{}{
		"library": map[string]interface{}{
			"@assetType": "library",
			"name":       name,
		},
	}

	result, status, err := ccapi.Query(config.GetCCAPIOrgURL(), "getNumberOfBooksFromLibrary", params)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach chaincode API"})
		return
	}
	if status != http.StatusOK {
		c.JSON(status, gin.H{"error": string(result)})
		return
	}

	var response map[string]interface{}
	json.Unmarshal(result, &response) //nolint:errcheck
	c.JSON(http.StatusOK, response)
}
