+++
date = '2024-10-19'
draft = false
title = 'Refining Load Balancer'
keywords = ['golang', 'layer 7 load balancer', 'Clean Architecture']
tags = ['Scalability', 'load balancer', 'Golang']
description = 'Refining Go-Based Load Balancers with Clean Architecture and Configuration-Driven Setup'
math = false
+++

In the last article, we covered the basics of building a Layer 7 load balancer in Go, touching on routing, SSL termination, and rate limiting. Since then, the focus has been on improving performance, maintainability, and scalability.

This article highlights key upgrades like adopting clean architecture, switching to configuration files, and using connection pooling to enhance backend communication. These changes make the system more flexible and set the stage for even more optimizations, including advanced health checkers, which we’ll explore in the next article.

<!--more-->

## Clean Architecture: A More Modular and Scalable Approach

As the project grew, it became clear that a more organized and scalable architecture was needed. With plans to add features like advanced rate limiting, routing strategies, and custom plugins, the initial structure began to feel restrictive. To keep the core logic isolated and clean, I moved to a clean architecture.

Here’s how it’s structured:

- **Domain Layer**: Houses core components like backend and rate limiter interfaces, and backend statuses. This defines the core business rules.
- **Usecases Layer**: Contains the main business logic, including load balancing, health checkers, and rate limiters.
- **Infrastructure Layer**: Manages external systems like logging (via zap) and configuration readers, keeping them separate from core logic.
- **Interfaces/HTTP Layer**: Handles the routing and middleware for incoming requests.

This structure helps keep code modular and maintainable, making it easier to add new features without unnecessary complexity or tight coupling.

### Benefits of Clean Architecture

One immediate benefit is improved modularity. Test cases are now kept with the code they test, making the project more organized and maintainable. Adding new features is easier too, thanks to interfaces that allow flexible implementations. During setup, these interfaces are injected with concrete implementations based on the configuration, enabling different behaviors without altering core code.

### Challenges and Learning Curve

Transitioning to clean architecture wasn’t without challenges. Having never used it before, I faced a learning curve—especially around maintaining separation of concerns and organizing components. Despite these hurdles, the change has been worthwhile, significantly improving scalability and maintainability, even though some areas are still being refined.

---

## Moving to a Configuration-Driven Setup with TOML and Viper

Initially, the load balancer’s settings, like backend details and routing strategies, were hardcoded. While manageable at first, this approach quickly became inflexible as the project grew. To address this, I switched to using TOML configuration files with the [Viper][viper] library for more dynamic configuration management.

### Why Use Configuration Files?

The switch to configuration files offered key advantages:

- **Flexibility**: All settings are now consolidated in one place, making it easier to adjust parameters like routing or backends without diving into multiple files.
- **Ease of Updates**: Testing and reverting changes is now streamlined since all modifications happen in a single file.

### Using Viper and TOML

I chose [TOML][toml] for its simplicity and readability, unlike [YAML][yaml], which can become cumbersome. TOML also allows for comments, making it easier to document configurations.

Current configurations include:

- **Routes and Backends**: Mapping backends to routes.
- **Rate Limiter Settings**: Managing allowed requests per second.
- **Health Checker Settings**: Configuring backend health checks.

Viper made it easy to load these configurations at startup, though error handling remains basic for now. The ability to switch environments (e.g., development and production) without altering code has been a significant improvement.

### Impact on Maintainability

The shift to a configuration-driven approach has boosted maintainability. As an open-source tool, the load balancer now allows users to customize features like route mapping and rate limiting through simple configuration changes, making it easier for others to adapt it to their needs.

Here's a snippet of what my config file looks like

```toml {id="config" lineNos=inline tabWidth=4}
[[routes]]
path = "/apiB"
[[routes.backends]]
url = "http://localhost:8082"
health = "/health"

[[routes.backends]]
url = "http://localhost:8084"
health = "/health"

[[routes.backends]]
url = "http://localhost:8085"
health = "/health"

[rateLimiter]
type = "none"
#type = "fixed_window"  # can be "fixed_window", "token_bucket", "none"
#limit = 100
#window = "1m"
```

---

## Improving Throughput with Connection Pooling

As the load balancer's performance demands increased, a critical step was to ensure efficient communication between the load balancer, health checkers, and backend servers. To achieve this, I introduced connection pooling, which significantly improved throughput and reduced latency.

### Why Connection Pooling?

Without pooling, the overhead of establishing new connections for every request added latency and constrained the number of simultaneous requests the system could handle. By reusing connections, I aimed to increase throughput while reducing the delay associated with setting up new connections for each backend communication.

### Implementing Connection Pooling

Instead of relying on an external library, I implemented connection pooling using Go’s built-in net/http library. Below is a code snippet demonstrating the pooling setup used in the health checkers:

```go {id="connection-pooling" lineNos=inline tabWidth=4}
transport := &http.Transport{
	MaxIdleConns:        50, // Maximum number of idle connections
	MaxIdleConnsPerHost: 10,
	IdleConnTimeout:     30 * time.Second,
	DisableKeepAlives:   false, // Ensure keep-alives are enabled for connection reuse
}
pooledClient := &http.Client{
	Transport: transport,
	Timeout:   3 * time.Second,
	}
```

This setup allows multiple connections to stay alive, ready for reuse, and ensures that requests do not have to constantly establish new connections. The `MaxIdleConns` and `MaxIdleConnsPerHost` parameters ensure that idle connections are reused, while the `IdleConnTimeout` controls how long idle connections remain open. The DisableKeepAlives flag ensures connection persistence.

### Health Checkers vs. Load Balancer

Connection pooling is handled independently by both the health checkers and the load balancer itself, each utilizing separate connection pools. Health checkers are run in separate Go routines from the load balancer, meaning they manage their own pool of connections to backend servers. This segregation allows both components to manage connections efficiently without interfering with each other.

---

## Ensuring Stability with Testing and Continuous Integration

As the load balancer grew in complexity, I realized the importance of automated testing and continuous integration (CI) to maintain stability and catch regressions early. By automating this process, I could focus on new features and improvements without worrying about breaking existing functionality.

### Why Add Testing and CI?

Manually testing every change became tedious and prone to human error, especially as the load balancer evolved. I wanted to ensure that core components—such as routing, health checks, and rate limiting—remained reliable. Automated tests not only reduced manual effort but also gave me confidence in the codebase's stability after each change.

### Test Coverage

I focused on building a robust set of unit tests, particularly for:

- **Load Balancer Request Routing**: Ensuring requests were routed correctly using the round-robin strategy.
- **Health Checkers**: Testing various scenarios, such as handling backends that were initially down but became healthy again, as well as the reverse.
- **Fixed-Window Rate Limiter**: Validating the correct enforcement of rate limits.

I also created a benchmark test to track performance changes and optimization efforts. Having these tests in place ensures that I can continuously improve the load balancer without fear of breaking core functionality.

### Organizing Tests

With clean architecture in place, I keep my tests alongside the code. This structure makes it easy to maintain modularity, with logically similar components grouped together. It also ensures that any new code or feature additions are covered with relevant tests, improving maintainability.

### Continuous Integration with GitHub Actions

I set up GitHub Actions to automate the execution of tests whenever code changes are pushed. The pipeline runs all unit tests and will soon include benchmarks as well, helping me track performance over time. This CI setup ensures that regressions are caught early, keeping the codebase reliable as new features are added.

### Challenges So Far?

Fortunately, I haven't encountered any major issues with the CI pipeline. The GitHub Actions integration has worked smoothly, and I plan to further optimize the pipeline as the project grows.

---

## Consistent Logging with Uber's Zap

As the load balancer matured, consistent and performant logging became a critical focus. Initially, I relied on Go's standard library for logging, but it quickly became apparent that it wasn't meeting my needs—especially when it came to performance and having granular control over log levels.

### Why Move to Zap?

The primary reason for switching to Uber’s [Zap][zap] was performance and flexibility. Unlike the standard library, Zap offers leveled logging, which was crucial when debugging specific issues. While I considered alternatives like [Zerolog][zerolog], I ultimately chose Zap for its balance between performance and broader support.

### Configuring Zap for Different Environments

Zap’s flexibility shines through in its configuration options. I set it up to use either production or development configurations depending on the environment. Production logging is optimized for performance, while development logging includes more detailed information for debugging.

- In performance-critical areas (e.g., the load balancer’s hot path), I use zap.Logger, which is optimized for low overhead.
- For startup tasks and less performance-sensitive code, I use `SugaredLogger`, which is more convenient for formatted output but slightly less performant. This is restricted to initialization logic to minimize overhead.

The logger is initialized in the infrastructure layer, and the instance is passed to various components throughout the application, ensuring consistency in how logging is handled across layers.

### Current Logging Setup

For now, logs are stored locally, and I’ve focused logging efforts primarily on errors and critical events in components like the health checkers. While this is still in the early stages, having a centralized logging approach has already proven useful for debugging and tracking the system’s state.

### Challenges so far?

Integrating Zap was a smooth experience. The SugaredLogger provided a great balance between ease of use and performance, though I kept its usage to a minimum in areas where performance is key.

---

## Conclusion

In this phase of enhancing the load balancer, the focus was on refining existing functionalities rather than introducing half-baked features. From transitioning to a clean architecture to adopting a configuration-driven approach, each change was aimed at improving maintainability, flexibility, and performance.

Switching to TOML-based configuration with Viper allowed for centralized settings, making the load balancer easier to test and maintain. This, combined with connection pooling, helped significantly boost throughput, improving efficiency when communicating with backend servers.

Introducing consistent logging with Zap provided deeper insight into the application’s state, allowing errors and events to be tracked without compromising performance. Furthermore, the addition of unit tests and continuous integration has strengthened the reliability of the load balancer, ensuring that any changes introduced are thoroughly tested for regression.

As I continue developing the load balancer, these improvements set a solid foundation for future feature additions—whether it's implementing new routing strategies, rate-limiting algorithms, or custom plugins.

In the next article, I’ll dive deeper into the improvements made to the health checkers, highlighting the changes that make backend monitoring more robust and responsive.

You can see the [github repository][gh_repo] here.


[gh_repo]: https://github.com/krispingal/l7lb
[toml]: https://toml.io/en/
[yaml]: https://yaml.org/
[zap]: https://github.com/uber-go/zap
[zerolog]: https://github.com/rs/zerolog
[viper]: https://github.com/spf13/viper
