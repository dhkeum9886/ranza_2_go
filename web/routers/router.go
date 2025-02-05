package routers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func APIRoutes(e *echo.Echo) {
	api := e.Group("/api")
	api.GET("/healthcheck", healthCheckHandler)
	api.GET("/test", testHandler)
}

func healthCheckHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"message": "healthy"})
}

func testHandler(c echo.Context) error {
	data := map[string]interface{}{
		"Title":   "API Test Page",
		"Heading": "Test Page",
		"Message": "This is a sample API page rendered with Go.",
	}

	c.Logger().Infof("템플릿 이름 요청: %s", "api/test.html")
	if err := c.Render(http.StatusOK, "api/test.html", data); err != nil {
		c.Logger().Errorf("템플릿 렌더링 중 오류 발생: %v", err)
		return c.String(http.StatusInternalServerError, "Internal Server Error")
	}

	return nil
}
