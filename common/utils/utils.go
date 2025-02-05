package utils

import (
	"errors"
	"log"
	"os"
	"path/filepath"
	"sync"
)

var (
	projectRoot string
	once        sync.Once
)

func isProduction() bool {
	return os.Getenv("APP_ENV") == "production"
}

func findGoModPath() (string, error) {
	currentDir, err := os.Getwd()
	if err != nil {
		return "", err
	}

	for {
		// 현재 디렉터리에 go.mod 파일이 존재하면 반환
		if _, err := os.Stat(filepath.Join(currentDir, "go.mod")); err == nil {
			return currentDir, nil
		}

		// 상위 디렉터리로 이동
		parentDir := filepath.Dir(currentDir)
		// 더 이상 올라갈 수 없으면 go.mod를 찾지 못한 것으로 간주
		if parentDir == currentDir {
			return "", errors.New("go.mod 파일을 찾을 수 없습니다")
		}

		currentDir = parentDir
	}
}

func initProjectRoot() {
	// go.mod 기반으로 프로젝트 루트를 찾는다.
	if root, err := findGoModPath(); err == nil {
		log.Printf("ProjectRoot - go.mod: %v", root)
		projectRoot = root
	} else {
		// go.mod를 찾지 못하면 실행 파일의 경로를 기준으로 설정한다.
		exePath, err := os.Executable()
		if err != nil {
			log.Fatalf("실행 파일 경로를 가져오지 못했습니다: %v", err)
		}
		projectRoot = filepath.Dir(exePath)
		log.Printf("ProjectRoot - exe: %v", projectRoot)
	}
}

func GetProjectRoot() string {
	once.Do(initProjectRoot)
	return projectRoot
}
