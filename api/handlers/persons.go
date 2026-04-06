package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/goledger/qa-test-api/ccapi"
	"github.com/goledger/qa-test-api/config"
)

type personRequest struct {
	ID          string  `json:"id"`
	Name        string  `json:"name" binding:"required"`
	DateOfBirth string  `json:"dateOfBirth"`
	Height      float64 `json:"height"`
}

// CreatePerson creates a new person asset on the blockchain.
func CreatePerson(c *gin.Context) {
	var req personRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assetData := map[string]interface{}{
		"@assetType": "person",
		"id":         req.ID,
		"name":       req.Name,
	}
	if req.DateOfBirth != "" {
		assetData["dateOfBirth"] = req.DateOfBirth
	}
	if req.Height != 0 {
		assetData["height"] = req.Height
	}

	requestData := map[string]interface{}{
		"asset": []interface{}{
			assetData,
		},
	}

	result, status, err := ccapi.Invoke(config.GetCCAPIOrgURL(), http.MethodPost, "createAsset", requestData)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach chaincode API"})
		return
	}
	if status != http.StatusOK {
		c.JSON(status, gin.H{"error": string(result)})
		return
	}

	var person map[string]interface{}
	json.Unmarshal(result, &person) //nolint:errcheck
	c.JSON(http.StatusCreated, person)
}
