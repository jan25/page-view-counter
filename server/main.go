package main

import (
	"github.com/gorilla/mux"
	"net/http"
	"log"
	"github.com/go-redis/redis"
	"time"
)

var redisClient *redis.Client

func init() {
	redisClient = redis.NewClient(&redis.Options{
		Addr:         "localhost:6379",
		DialTimeout:  10 * time.Second,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		PoolSize:     10,
		PoolTimeout:  30 * time.Second,
	})

	pong, err := redisClient.Ping().Result()
	log.Println(pong, err)
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/inc/{url}", incrementPageCount).Methods("GET")
	// Add a handler to get stats
	log.Fatal(http.ListenAndServe(":8000", router))
}

func incrementPageCount(w http.ResponseWriter, r *http.Request) {
	param := mux.Vars(r)
	log.Println("var %v" , param)
}