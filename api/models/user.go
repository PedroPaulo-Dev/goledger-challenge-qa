package models

import "sync"

// User represents an API user stored in memory.
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

var (
	mu     sync.RWMutex
	users  = []User{
		{ID: 1, Username: "admin", Password: "admin123", Role: "admin"},
		{ID: 2, Username: "user1", Password: "pass123",  Role: "user"},
	}
	nextID = 3
)

// FindUserByUsername returns the user with the given username, or nil.
func FindUserByUsername(username string) *User {
	mu.RLock()
	defer mu.RUnlock()
	for i := range users {
		if users[i].Username == username {
			return &users[i]
		}
	}
	return nil
}

// AddUser creates a new user and returns it.
func AddUser(username, password, role string) *User {
	mu.Lock()
	defer mu.Unlock()
	u := User{ID: nextID, Username: username, Password: password, Role: role}
	nextID++
	users = append(users, u)
	return &users[len(users)-1]
}
