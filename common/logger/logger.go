package logger

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"ranza_2/common/utils"

	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
)

const (
	Reset   = "\033[0m"
	Red     = "\033[91m"
	Green   = "\033[92m"
	Yellow  = "\033[93m"
	Blue    = "\033[94m"
	White   = "\033[97m"
	Magenta = "\033[95m"
	Bold    = "\033[1m"
)

var (
	logFilePath string
	logFileName string
	logPathSet  bool
	once        sync.Once
)

type Logger struct {
	consoleLogger *log.Logger
	fileLogger    *log.Logger
}

func SetLogPath(path, filename string) error {
	var called bool // 로컬 변수, 클로저 내에서 true로 설정됨

	once.Do(func() {
		called = true // 최초 실행 시 호출됨

		// 절대 경로가 아니라면 프로젝트 루트를 기준으로 변환
		if !filepath.IsAbs(path) {
			path = filepath.Join(utils.GetProjectRoot(), path)
		}

		logFilePath = path
		logFileName = filename
		logPathSet = true
	})

	// once.Do가 클로저를 실행하지 않았다면, 이미 SetLogPath가 호출된 상태
	if !called {
		return fmt.Errorf("SetLogPath는 프로젝트에서 한 번만 호출할 수 있습니다")
	}

	return nil
}

func NewLogger(enableFileLogging ...bool) *Logger {
	if !logPathSet {
		log.Fatal("SetLogPath가 호출되지 않았습니다. NewLogger를 호출하기 전에 SetLogPath를 실행하세요.")
	}

	enableFile := true
	if len(enableFileLogging) > 0 {
		enableFile = enableFileLogging[0]
	}

	consoleLogger := log.New(os.Stdout, "", 0)
	var fileLogger *log.Logger

	if enableFile {
		err := os.MkdirAll(logFilePath, os.ModePerm)
		if err != nil {
			consoleLogger.Fatalf("로그 디렉토리 생성 실패: %v", err)
		}

		logFilePattern := filepath.Join(logFilePath, strings.TrimSuffix(logFileName, filepath.Ext(logFileName))+"-%Y-%m-%d"+filepath.Ext(logFileName))

		writer, err := rotatelogs.New(
			logFilePattern,
			rotatelogs.WithLinkName(filepath.Join(logFilePath, logFileName)),
			rotatelogs.WithMaxAge(7*24*time.Hour),
			rotatelogs.WithRotationTime(24*time.Hour),
		)
		if err != nil {
			consoleLogger.Fatalf("로그 로테이터 초기화 실패: %v", err)
		}

		fileLogger = log.New(writer, "", 0)
	}

	return &Logger{
		consoleLogger: consoleLogger,
		fileLogger:    fileLogger,
	}
}

func formatMessage(args ...interface{}) string {
	if len(args) == 0 {
		return ""
	}
	if len(args) == 1 {
		return fmt.Sprintf("%v", args[0])
	}
	format, ok := args[0].(string)
	if !ok {
		return fmt.Sprintf("%v", args[0])
	}
	return fmt.Sprintf(format, args[1:]...)
}

func (l *Logger) logMessage(level string, color string, message string) {
	timestamp := time.Now().Format("15:04:05.000")

	_, fullPath, line, ok := runtime.Caller(2)
	if !ok {
		fullPath = "unknown"
		line = 0
	}

	relativePath := strings.TrimPrefix(strings.TrimSpace(strings.ToLower(filepath.ToSlash(fullPath))), strings.TrimSpace(strings.ToLower(filepath.ToSlash(utils.GetProjectRoot()))))
	if strings.HasPrefix(relativePath, "/") {
		relativePath = relativePath[1:]
	}
	relativePath = fmt.Sprintf("%s:%d", relativePath, line)

	if l.consoleLogger != nil {
		coloredRelativePath := fmt.Sprintf("%s%s%s%s", Bold, Magenta, relativePath, Reset)
		coloredLevel := fmt.Sprintf("%s[%s]%s", color, level, Reset)
		coloredMessage := fmt.Sprintf("%s %s%s%s %s",
			timestamp, Bold, coloredRelativePath, Reset, coloredLevel+" "+message)
		l.consoleLogger.Println(coloredMessage)
	}

	if l.fileLogger != nil {
		fileMessage := fmt.Sprintf("%s %s %s %s",
			timestamp, relativePath, level, message)
		l.fileLogger.Println(fileMessage)
	}
}

func (l *Logger) Info(args ...interface{}) {
	message := formatMessage(args...)
	l.logMessage("INFO", Green, message)
}

func (l *Logger) Warning(args ...interface{}) {
	message := formatMessage(args...)
	l.logMessage("WARNING", Yellow, message)
}

func (l *Logger) Error(args ...interface{}) {
	message := formatMessage(args...)
	l.logMessage("ERROR", Red, message)
}

func (l *Logger) Fatal(args ...interface{}) {
	message := formatMessage(args...)
	l.logMessage("FATAL", Red, message)
	os.Exit(1)
}

func (l *Logger) Debug(args ...interface{}) {
	message := formatMessage(args...)
	l.logMessage("DEBUG", Blue, message)
}
