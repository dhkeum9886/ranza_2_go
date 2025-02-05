package main

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"html/template"
	"io"
	"os"
	"path/filepath"

	"ranza_2/common/config"
	"ranza_2/common/logger"
	"ranza_2/common/redis"
	"ranza_2/web/routers"
)

// global
var (
	log *logger.Logger
	e   = echo.New()
	cfg = config.LoadConfig()
)

func main() {
	Initialize()
	StartServer()
}

func Initialize() {
	// logger
	logger.SetLogPath("logs", "app.log")
	log = logger.NewLogger()

	// middleware
	//e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Static("/", filepath.Join("frontend", "dist"))

	// template
	// 템플릿 로드 및 등록
	var templateFiles []string
	err := filepath.Walk("view/dist/templates", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && filepath.Ext(path) == ".html" {
			templateFiles = append(templateFiles, path)
		}
		return nil
	})
	if err != nil {
		log.Fatal("템플릿 파일 검색 중 오류: %v", err)
	}
	if len(templateFiles) == 0 {
		log.Fatal("템플릿 파일을 찾을 수 없습니다: view/dist/templates")
	} else {
		//log.Info("로드된 템플릿 파일 목록: %v", templateFiles)
	}

	// 템플릿 등록
	templates := template.New("")
	for _, file := range templateFiles {
		// 파일 경로를 슬래시(/)로 변환한 상대 경로로 템플릿 이름 설정
		relativePath, err := filepath.Rel("view/dist/templates", file)
		if err != nil {
			log.Fatal("템플릿 파일 상대 경로 생성 중 오류: %v", err)
		}
		relativePath = filepath.ToSlash(relativePath)

		// 템플릿 파일 파싱 및 등록
		content, err := os.ReadFile(file)
		if err != nil {
			log.Fatal("템플릿 파일 읽기 중 오류: %v", err)
		}
		_, err = templates.New(relativePath).Parse(string(content))
		if err != nil {
			log.Fatal("템플릿 파일 파싱 중 오류: %v", err)
		}
	}

	// 템플릿 엔진 설정
	e.Renderer = &TemplateRegistry{templates: templates}

	// 정적 파일 경로 설정
	e.Static("/static", "view/dist/static")

	e.GET("/", func(c echo.Context) error {
		// index.html 템플릿을 렌더링하여 반환
		return c.Render(200, "index.html", map[string]interface{}{
			"Title":   "Welcome to Echo",
			"Heading": "Hello, Echo!",
			"Message": "This is a sample page rendered with Go.",
		})
	})

	// router
	routers.APIRoutes(e)

	// redis
	host, ok := cfg["REDIS_HOST"].(string)
	if !ok {
		log.Fatal("REDIS_HOST 설정이 유효하지 않습니다: %v", cfg["REDIS_HOST"])
	}
	port, ok := cfg["REDIS_PORT"].(int)
	if !ok {
		log.Fatal("REDIS_PORT 설정이 유효하지 않습니다: %v", cfg["REDIS_PORT"])
	}
	db, ok := cfg["REDIS_DB"].(int)
	if !ok {
		db = 0 // 기본값
	}
	password, _ := cfg["REDIS_PASSWORD"].(string) // 없는 경우 기본 빈 문자열 사용
	addr := fmt.Sprintf("%s:%d", host, port)
	redisErr := redis.InitRedis(addr, password, db)
	if redisErr != nil {
		log.Error("Redis 초기화 실패: %v", err)
	}

	// TODO mqtt

	// TODO db

	// TODO ...
}

func StartServer() {
	serverPort, ok := cfg["SERVER_PORT"].(int)
	if !ok {
		log.Fatal("SERVER_PORT 값이 유효하지 않습니다: %v", cfg["SERVER_PORT"])
	}

	port := fmt.Sprintf(":%d", serverPort)

	log.Info("Starting server on port %s", port)
	if err := e.Start(port); err != nil {
		log.Fatal("서버 시작 실패: %v", err)
	}
}

type TemplateRegistry struct {
	templates *template.Template
}

func (t *TemplateRegistry) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	if err := t.templates.ExecuteTemplate(w, name, data); err != nil {
		log.Error("템플릿 렌더링 중 오류 발생: %v", err)
		return err
	}
	return nil
}
