# 1단계: 프론트엔드 빌드 (Node 기반)
FROM node:16.13.0 AS frontend-builder
WORKDIR /app/view

# 소스코드 전체 복사 후 빌드
COPY web/view/ .
RUN npm install
RUN npm run build

# 2단계: Go 서버 빌드
FROM golang:1.23.5-alpine AS backend-builder
WORKDIR /app

# go.mod와 go.sum 복사 및 의존성 다운로드
COPY go.mod go.sum ./
RUN go mod download

# 소스 코드 및 로컬 패키지 복사
COPY common ./common
COPY env ./env
COPY web ./web
COPY ./env/docker.env .env

# Go 애플리케이션 빌드
RUN go build -o server ./web

# 3단계: 최종 실행 이미지
FROM alpine:latest
WORKDIR /app

RUN mkdir -p /app/log

# 실행 파일, 정적 파일, 환경설정 파일 복사
COPY --from=frontend-builder /app/view/dist ./view/dist
COPY --from=backend-builder /app/server .
COPY --from=backend-builder /app/env ./env
COPY --from=backend-builder /app/.env ./.env

EXPOSE 8080

CMD ["./server"]
