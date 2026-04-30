+++
title = "Montgomery Multiplication"
date = 2026-01-15
+++

# Complexity Estimate

We're modeling migration effort as a function of service coupling. For a monolith
with $n$ services and dependency density $d$, the estimated migration cost scales as:

$$C(n, d) = \alpha \cdot n \log n + \beta \cdot d \cdot n^2$$

```python
class RequestRouter:
    def __init__(self, services: dict[str, Service]):
        self.services = services
        self.metrics = MetricsCollector()

    def dispatch(self, request: Request) -> Response:
        service = self.services.get(request.path.split("/")[1])
        if service is None:
            return Response(404, "Not Found")

        with self.metrics.timer(service.name):
            return service.handle(request)
```


