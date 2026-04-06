FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o qa-test-api .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/qa-test-api .
COPY --from=builder /app/docs ./docs
EXPOSE 8080
CMD ["./qa-test-api"]
