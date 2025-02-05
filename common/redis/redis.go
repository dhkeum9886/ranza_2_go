package redis

import (
	"context"
	"github.com/go-redis/redis/v8"
	"log"
	"time"
)

var RedisClient *redis.Client

func InitRedis(addr, password string, db int) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	// Redis 연결 테스트
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("Redis 연결 실패: %v", err)
		return err
	}

	log.Printf("Redis 연결 성공: %s (DB: %d)", addr, db)
	return nil
}
