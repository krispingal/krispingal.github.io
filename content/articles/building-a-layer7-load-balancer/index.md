+++
date = '2024-09-15T15:05:28-06:00'
draft = false
title = 'Building a Layer 7 Load Balancer'
description = 'Building a layer 7 Load balancer in go that routes requests, SSL termination, rate limiting.'
keywords = ['golang', 'layer 7 load balancer']
tags = ['golang', 'load balancer']
images = ['load_balancer.webp']
math = false
+++

Load balancers are essential for applications or services that handle high volumes of traffic, ensuring that they can scale efficiently to meet demand. Modern load balancers have evolved into comprehensive traffic management solutions, often incorporating rate limiting, caching, DDoS protection, and more, making them indispensable for high-scale systems.

## What is a load balancer?

Imagine you're at an airport, standing in line for the security check. There is a single line of passengers, but there are five booths with agents checking boarding passes and IDs. At the front of the line, there is an agent directing passengers to available booths. This agent acts like a basic load balancer, distributing incoming requests (passengers) to backend servers (TSA agents) for processing.

<!--more-->

A load balancer does more than distribute requests. It also monitors the health of backend servers by periodically sending health checks or heartbeats to ensure they're functioning properly. Load balancers periodically run health checks so that requests do not get routed to unhealthy servers.

Types of Load Balancers

There are two common types of load balancers:

1. **Layer 4 Load Balancer**: Operates at the transport layer (TCP/UDP), distributing traffic based on IP addresses and ports.
2. **Layer 7 Load Balancer**: Operates at the application layer (HTTP), distributing requests based on more granular details such as URL paths, headers, and even request content.

Popular load balancers include AWS [Elastic Load Balancer][ELB], [NGINX][NGINX], and [HAProxy][HAProxy].

---

## What is a layer 4 load balancer?

A Layer 4 load balancer operates at the transport layer (OSI Layer 4), distributing network traffic based on information from the TCP/UDP protocol. It does not inspect the application-level data, meaning it forwards packets to the backend servers without interpreting their content. Layer 4 load balancers make decisions based on the destination IP address and port.

Below is a diagram of a simple load balancer. Requests (R1, R2, R3, R4) are distributed to three backend servers, and the forwarded requests are shown as FR1, FR2, FR3, and FR4.

{{< figure src="load_balancer.webp" title="Diagram of a load balancer" loading="lazy" >}}

Below is code for a simple load balancer that supports HTTP routes request in a Round Robin fashion.

```go {id="minimal-l4" lineNos=inline tabWidth=4}
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"sync/atomic"
	"time"
)

type Backend struct {
	URL    string
	Alive  bool
	Health string
}
type LoadBalancer struct {
	backends []*Backend
	current  uint32
}

func (lb *LoadBalancer) getNextBackend() *Backend {
	next := atomic.AddUint32(&lb.current, 1)
	return lb.backends[next%uint32(len(lb.backends))]
}
// Periodically check all backends for health
func (lb *LoadBalancer) healthCheck() {
	for _, backend := range lb.backends {
		go func(b *Backend) {
			for {
				resp, err := http.Get(b.URL + b.Health)
				if err != nil || resp.StatusCode != http.StatusOK {
					b.Alive = false
					log.Printf("Backend %s is down\n", b.URL)
				} else {
					b.Alive = true
					log.Printf("Backend %s is up\n", b.URL)
				}
				time.Sleep(10 * time.Second)
			}
		}(backend)
	}
}
// Proxy forwards the request r to a backend and returns response w
func (lb *LoadBalancer) proxy(w http.ResponseWriter, r *http.Request) {
	backend := lb.getNextBackend()

    // Forward request to backend
	resp, err := http.Get(backend.URL + r.URL.Path)
	if err != nil || !backend.Alive {
		http.Error(w, "Backend unavailable", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

    // Copies the response back to client
	for k, v := range resp.Header {
		w.Header()[k] = v
	}

	_, err = io.Copy(w, resp.Body)
	if err != nil {
		log.Printf("Error copying response from backend: %v", err)
		http.Error(w, "Error forwarding response", http.StatusInternalServerError)
	}
}

func main() {
    // This can be any list of backends that you have
	backends := []*Backend{
		{URL: "http://localhost:8081", Alive: true, Health: "/health"},
		{URL: "http://localhost:8082", Alive: true, Health: "/health"},
	}

	lb := &LoadBalancer{backends: backends}

	go lb.healthCheck()
	http.HandleFunc("/", lb.proxy)
	fmt.Println("Load Balancer started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

You can refer to this [article][kasvith_article] which I referred for inspiration when building a simple load balancer.

---

## What is a layer 7 load balancer?

Layer 7 load balancers operate at the application layer (OSI Layer 7) and are more "intelligent" compared to Layer 4 load balancers. They can inspect request URLs, headers, and even body content, allowing them to make more sophisticated routing decisions based on application-level data.

### Key Features of Layer 7 Load Balancers:

- **Routing based on URLs and parameters**: They can route requests to specific backend servers based on the request path, query parameters, or headers.
- **Sticky sessions**: They can ensure that requests from the same user are consistently routed to the same server, which is useful for session persistence.
- **Caching**: They can cache responses, reducing the need to forward identical requests to the backend servers, which helps improve performance and reduce server load.

While these features provide greater flexibility, they also come at the cost of increased complexity, maintenance, and performance overhead. However, for applications with sophisticated routing requirements, Layer 7 load balancers are often worth the trade-offs.

## SSL Termination

Layer 7 load balancers can perform SSL termination, where encrypted SSL/TLS traffic is decrypted at the load balancer, and plain HTTP requests are forwarded to the backend servers. This offloads the computational burden of encryption from the backend servers and centralizes SSL certificate management.

Here’s how you can add SSL termination to your load balancer using Go:

```go {id="minimal-SSL-termination" lineNos=inline tabWidth=4}
package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
)

func main() {
	// Load the SSL certificate and key (You need to generate SSL certificates)
	certFile := "cert.pem"
	keyFile := "key.pem"

	// Define your LoadBalancer handler
	lb := &LoadBalancer{}

	// Create an HTTPS server with SSL termination
	server := &http.Server{
		Addr:    ":8443", // or any other port
		Handler: http.HandlerFunc(lb.proxy),
		TLSConfig: &tls.Config{
			MinVersion: tls.VersionTLS13, // or TLS12 if compatibility is needed
		},
	}

	fmt.Println("Load Balancer with SSL started at :8443")
	// Start the HTTPS server with SSL
	log.Fatal(server.ListenAndServeTLS(certFile, keyFile))
}

```

Key Steps for SSL Termination:

- **SSL Certificate**: You’ll need to generate or obtain SSL certificates (cert.pem and key.pem). For development purposes, you can use self-signed certificates, but in production, you would obtain certificates from a trusted Certificate Authority (CA).
- **TLS Configuration**: The TLSConfig allows you to specify the minimum TLS version for security. TLS 1.3 is preferred for modern security standards.
- **HTTPS Server**: The ListenAndServeTLS method starts the HTTPS server, handling SSL/TLS connections.

## Routing requests

A Layer 7 load balancer can inspect request URLs and headers, allowing it to route traffic to specific backend services based on the request's path or parameters. This enables the load balancer to route traffic more intelligently. For example, API requests can be routed to different services (e.g., /apiA or /apiB) based on the URL path.

Each backend service typically registers its routes with the load balancer, specifying the paths or criteria that it can handle. The load balancer then forwards the appropriate requests to the right service.

**Example: Minimal Request Router in Go**

A Layer 7 load balancer can inspect request URLs and headers, allowing it to route traffic to specific backend services based on the request's path or parameters. This enables the load balancer to route traffic more intelligently. For example, API requests can be routed to different services (e.g., /apiA or /apiB) based on the URL path.

Each backend service typically registers its routes with the load balancer, specifying the paths or criteria that it can handle. The load balancer then forwards the appropriate requests to the right service.
Example: Minimal Request Router in Go

Here's a minimal Go code example that demonstrates routing requests to different backend services using a simple path-based routing mechanism.

```go {id="minimal-l7" lineNos=inline tabWidth=4}
package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
)

type Backend struct {
	URL string
}

// RouteTable maps paths to specific backends
type RouteTable map[string]*Backend

type SimpleRouter struct {
	routes RouteTable
}

// NewSimpleRouter initializes a router with predefined routes
func NewSimpleRouter(routes RouteTable) *SimpleRouter {
	return &SimpleRouter{routes: routes}
}

// ServeHTTP implements http.Handler and performs routing
func (sr *SimpleRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Extract the base path (e.g., /apiA, /apiB)
	basePath := strings.Split(r.URL.Path, "/")[1]
	backend, exists := sr.routes["/"+basePath]

	if !exists {
		http.Error(w, "Service not found", http.StatusNotFound)
		return
	}

	// Forward the request to the appropriate backend
	resp, err := http.Get(backend.URL + r.URL.Path)
	if err != nil {
		http.Error(w, "Backend unavailable", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// Copy backend response back to client
	for k, v := range resp.Header {
		w.Header()[k] = v
	}
	_, err = http.Copy(w, resp.Body)
	if err != nil {
		http.Error(w, "Error forwarding response", http.StatusInternalServerError)
	}
}

func main() {
	// Register routes to backend services
	routes := RouteTable{
		"/apiA": {URL: "http://localhost:8081"},
		"/apiB": {URL: "http://localhost:8082"},
	}

	router := NewSimpleRouter(routes)

	// Start the HTTP server with the router
	fmt.Println("Load Balancer started at :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
```

---

## Rate limiting

Rate limiting is an important feature that prevents backend servers from being overwhelmed by excessive requests during high traffic periods. Without rate limiting or similar protection, servers—or the entire service—could experience downtime or degraded performance.

There are various algorithms used to implement rate limiting, each designed to control the flow of traffic in a different way. One common algorithm is the token bucket rate limiter, which allows a limited number of requests per time window. If the number of requests exceeds this limit, excess requests are denied. There are a couple of algorithms in performing rate limiting, you can refer this [link][rl_reference] to check it out.

### Example: Token Bucket Rate Limiter in Go

Below is a minimal implementation of a token bucket rate limiter. The limiter controls the number of requests allowed in a given time window.

```go {id="token-bucket" lineNos=inline tabWidth=4}
package main

import (
	"log"
	"net/http"
	"sync"
	"time"
)

type RateLimiter struct {
	requests   int
	limit      int
	window     time.Duration
	mu         sync.Mutex
	resetTimer *time.Ticker
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests:   0,
		limit:      limit,
		window:     window,
		resetTimer: time.NewTicker(window),
	}
	go rl.reset()

	return rl
}

func (rl *RateLimiter) Allow() bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	if rl.requests >= rl.limit {
		return false
	}
	rl.requests++
	return true
}

func (rl *RateLimiter) reset() {
	for range rl.resetTimer.C {
		rl.mu.Lock()
		rl.requests = 0
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !rl.Allow() {
			log.Printf("Rate limit exceeded for %s", r.URL.Path)
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	limiter := NewRateLimiter(10, time.Minute)

	http.Handle("/", limiter.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Request successful!"))
	})))

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

```

The above rate limiter is now based on a global request counter rather than IP-based tracking, making it simpler for demonstration purposes.

---

## Future improvements

For future improvements, I plan to:

- Set up a circuit breaker – To prevent overwhelming backends that are failing or underperforming by temporarily stopping requests to them.
- Explore different routing strategies, like weighted round robin or least connections, to optimize request distribution based on backend capacity.
- Dynamically update the backend servers list – Automatically remove any failing servers from the list and add new ones without downtime.
- Implement session persistence, ensuring that users consistently connect to the same backend during their session.
- Cache requests to reduce load on backends and improve response times for repeated requests.

See the [github repository][gh_repo].

[gh_repo]: https://github.com/krispingal/l7lb
[ELB]: https://aws.amazon.com/elasticloadbalancing/
[NGINX]: https://www.f5.com/go/product/welcome-to-nginx
[HAProxy]: https://www.haproxy.org/
[kasvith_article]: https://kasvith.me/posts/lets-create-a-simple-lb-go/
[rl_reference]: https://blog.logrocket.com/advanced-guide-rate-limiting-api-traffic-management/