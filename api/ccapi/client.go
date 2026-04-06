package ccapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/goledger/qa-test-api/config"
)

// addAuth attaches the CCAPI Basic Auth header to a request when credentials
// are configured via environment variables.
func addAuth(req *http.Request) {
	if auth := config.GetCCAPIBasicAuth(); auth != "" {
		req.Header.Set("Authorization", auth)
	}
}

// Query sends a read-only request to the CCAPI query endpoint (POST /api/query/:txName).
func Query(baseURL, txName string, params map[string]interface{}) ([]byte, int, error) {
	data, err := json.Marshal(params)
	if err != nil {
		return nil, 0, err
	}

	url := fmt.Sprintf("%s/api/query/%s", baseURL, txName)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	addAuth(req)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	return body, resp.StatusCode, err
}

// Invoke sends a state-changing request to the CCAPI invoke endpoint.
func Invoke(baseURL, method, txName string, params map[string]interface{}) ([]byte, int, error) {
	data, err := json.Marshal(params)
	if err != nil {
		return nil, 0, err
	}

	url := fmt.Sprintf("%s/api/invoke/%s", baseURL, txName)
	req, err := http.NewRequest(method, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	addAuth(req)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	return body, resp.StatusCode, err
}
