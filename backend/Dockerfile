# Build stage
FROM golang:1.24-bookworm AS builder

WORKDIR /app

# Enable direct proxy for better network stability
ENV GOPROXY=https://proxy.golang.org,direct
RUN apt-get update && apt-get install -y git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o main .

# Run stage
FROM alpine:latest
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/.env .

EXPOSE 8080

CMD ["./main"]
