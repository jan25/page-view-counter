package main

import (
	"github.com/gorilla/mux"
	"net/http"
	"log"
	"github.com/go-redis/redis"
	"time"
	"github.com/googollee/go-socket.io"
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
	path := param["url"]
	w.WriteHeader(http.StatusOK)

	log.Printf("var: %v , path: %s" , param , path)

	// increment counter of path if path doesn't exist
	// else set it to 1
	err := redisClient.Incr(path).Err()
	if err != nil {
		log.Printf("Failed to increment %v", err)
	}else{
		log.Printf("Increamented successfully")
		val, err := redisClient.Get(path).Int64()
		if err != nil {
			log.Printf("Failed to get value %v", err)
		}else{
			log.Printf("Value for key: %d\n", val )
		}
	}

    // This is weird
	//val , err := redisClient.Get(path).Int64()
	//if err != nil{
	//	log.Printf("foo")
	//}else{
	//	log.Printf("Old value: %d\n", val)
	//	err = redisClient.Incr(path).Err()
	//	if err != nil {
	//		log.Fatal("Failed to increament counter")
	//	} else{
	//		val, err = redisClient.Get(path).Int64()
	//		log.Printf("New vale: %d\n", val)
	//
	//	}
	//
	//}

}