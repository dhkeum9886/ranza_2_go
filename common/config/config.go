package config

import (
	"log"
	"os"
	"path/filepath"
	"strconv"
	"sync"

	"github.com/joho/godotenv"

	"ranza_2/common/utils"
)

type Config map[string]interface{}

var (
	instance Config
	once     sync.Once
)

func LoadConfig() Config {
	wd := utils.GetProjectRoot()

	envPath := filepath.Join(wd, ".env")
	log.Printf("APP_ENV:", os.Getenv("APP_ENV"))
	log.Printf("envPath:", envPath)

	if err := godotenv.Overload(envPath); err != nil {
		log.Printf("%v 파일을 로드하지 못했습니다. \n%v", envPath, err)
	}

	env := os.Getenv("APP_ENV")
	switch env {
	case "development":
		if err := godotenv.Overload(filepath.Join(wd, "env", "development.env")); err != nil {
			log.Printf("development.env 파일을 로드하지 못했습니다:", err)
		}
	case "production":
		if err := godotenv.Overload(filepath.Join(wd, "env", "production.env")); err != nil {
			log.Printf("production.env 파일을 로드하지 못했습니다:", err)
		}
	default:
		log.Printf("APP_ENV가 설정되지 않았거나 알 수 없는 값입니다. 기본 설정만 사용합니다.")
	}

	instance = Config{}

	for _, env := range os.Environ() {
		pair := splitEnv(env)
		key := pair[0]
		value := pair[1]

		if intValue, err := strconv.Atoi(value); err == nil {
			instance[key] = intValue
		} else {
			instance[key] = value
		}
	}

	return instance
}

func splitEnv(env string) [2]string {
	pair := [2]string{}
	eqIndex := -1
	for i, char := range env {
		if char == '=' {
			eqIndex = i
			break
		}
	}
	if eqIndex != -1 {
		pair[0] = env[:eqIndex]
		pair[1] = env[eqIndex+1:]
	}
	return pair
}
