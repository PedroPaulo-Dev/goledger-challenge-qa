package config

import (
	"encoding/base64"
	"os"
)

// JWTSecret is the key used to sign JWT tokens.
const JWTSecret = "secret"

// GetCCAPIOrgURL returns the base URL for the CCAPI instance.
func GetCCAPIOrgURL() string {
	if url := os.Getenv("CCAPI_ORG_URL"); url != "" {
		return url
	}
	return "http://localhost:80"
}

// GetCORSOrigin returns the allowed origin for CORS requests.
// Defaults to "*" when the CORS_ORIGIN environment variable is not set.
func GetCORSOrigin() string {
	if origin := os.Getenv("CORS_ORIGIN"); origin != "" {
		return origin
	}
	return "*"
}

// GetCCAPIBasicAuth returns the Base64-encoded Basic Auth header value for
// upstream requests to the CCAPI.  Credentials are read from the environment
// variables CCAPI_AUTH_USERNAME and CCAPI_AUTH_PASSWORD.
func GetCCAPIBasicAuth() string {
	username := os.Getenv("CCAPI_AUTH_USERNAME")
	password := os.Getenv("CCAPI_AUTH_PASSWORD")
	if username == "" && password == "" {
		return ""
	}
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(username+":"+password))
}
