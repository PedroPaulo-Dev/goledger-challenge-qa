package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/goledger/qa-test-api/ccapi"
	"github.com/goledger/qa-test-api/config"
)

type bookRequest struct {
	Title     string   `json:"title"  binding:"required"`
	Author    string   `json:"author" binding:"required"`
	Genres    []string `json:"genres"`
	BookType  *int     `json:"bookType"`
	Published string   `json:"published"`
}

// GetBooks returns books written by a given author with optional genre filtering and pagination.
func GetBooks(c *gin.Context) {
	authorName := c.Query("author")
	if authorName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'author' is required"})
		return
	}

	genre := c.Query("genre")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	queryParams := map[string]interface{}{
		"authorName": authorName,
	}
	result, status, err := ccapi.Query(config.GetCCAPIOrgURL(), "getBooksByAuthor", queryParams)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach chaincode API"})
		return
	}
	if status != http.StatusOK {
		c.JSON(status, gin.H{"error": string(result)})
		return
	}

	var ccapiRes map[string]interface{}
	if err := json.Unmarshal(result, &ccapiRes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unexpected response from chaincode API"})
		return
	}
	books, ok := ccapiRes["result"].([]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unexpected response from chaincode API"})
		return
	}

	var filteredBooks []map[string]interface{}

	if genre != "" {
		filtered := make([]map[string]interface{}, 0)
		for _, book := range books {
			bookMap, ok := book.(map[string]interface{})
			if !ok {
				continue
			}
			genres, ok := bookMap["genres"].([]interface{})
			if !ok {
				continue
			}
			for _, g := range genres {
				if gs, ok := g.(string); ok && gs == genre {
					filtered = append(filtered, bookMap)
					break
				}
			}
		}
		filteredBooks = filtered
	}

	offset := page * limit
	if offset >= len(filteredBooks) {
		c.JSON(http.StatusOK, []map[string]interface{}{})
		return
	}
	end := offset + limit
	if end > len(books) {
		end = len(books)
	}
	c.JSON(http.StatusOK, books[offset:end]) //nolint:errcheck
}

// CreateBook creates a new book asset on the blockchain.
func CreateBook(c *gin.Context) {
	var req bookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assetData := map[string]interface{}{
		"@assetType": "book",
		"title":      req.Title,
		"author":     req.Author,
	}
	if len(req.Genres) > 0 {
		assetData["genres"] = req.Genres
	}
	if req.BookType != nil {
		assetData["bookType"] = *req.BookType
	}
	if req.Published != "" {
		assetData["published"] = req.Published
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

	var book map[string]interface{}
	json.Unmarshal(result, &book) //nolint:errcheck

	c.JSON(http.StatusCreated, book) //nolint:errcheck
}

// DeleteBook deletes a book; registered without auth middleware (BUG-003 lives in routes.go).
func DeleteBook(c *gin.Context) {
	title := c.Query("title")
	author := c.Query("author")
	if title == "" || author == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameters 'title' and 'author' are required"})
		return
	}

	params := map[string]interface{}{
		"key": map[string]interface{}{
			"@assetType": "book",
			"title":      title,
			"author":     author,
		},
	}

	result, status, err := ccapi.Invoke(config.GetCCAPIOrgURL(), http.MethodDelete, "deleteAsset", params)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach chaincode API"})
		return
	}
	if status != http.StatusOK {
		c.JSON(status, gin.H{"error": string(result)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "book deleted successfully"})
}

type updateTenantRequest struct {
	Title    string `json:"title"    binding:"required"`
	Author   string `json:"author"   binding:"required"`
	TenantID string `json:"tenantId" binding:"required"`
}

// UpdateBookTenant assigns a tenant (person) to a book.
func UpdateBookTenant(c *gin.Context) {
	var req updateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	params := map[string]interface{}{
		"book": map[string]interface{}{
			"@assetType": "book",
			"title":      req.Title,
			"author":     req.Author,
		},
		"tenant": map[string]interface{}{
			"@assetType": "person",
			"id":         req.TenantID,
		},
	}

	// BUG-008: Calls the read-only query path instead of the invoke path.
	result, status, err := ccapi.Query(config.GetCCAPIOrgURL(), "updateBookTenant", params)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach chaincode API"})
		return
	}
	if status != http.StatusOK {
		c.JSON(status, gin.H{"error": string(result)})
		return
	}

	var book map[string]interface{}
	json.Unmarshal(result, &book) //nolint:errcheck
	c.JSON(http.StatusOK, book)
}
