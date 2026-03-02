+++
title = "Project Kickoff & Scope Definition"
date = 2026-01-15
+++

We kicked off the Alpha Corp engagement this week with a two-day on-site workshop.
The primary goal was to align on scope, identify key stakeholders, and establish
the cadence for the twelve-week engagement.

## Scope

The engagement covers three workstreams: a full audit of the existing monolith
architecture, a cloud migration feasibility study, and recommendations for
restructuring the engineering organisation to support autonomous product teams.

## Key Stakeholders

We'll be working closely with the VP of Engineering, the Head of Infrastructure,
and two staff engineers who hold most of the institutional knowledge around the
legacy payment processing pipeline.

## Complexity Estimate

We're modelling migration effort as a function of service coupling. For a monolith
with $n$ services and dependency density $d$, the estimated migration cost scales as:

$$C(n, d) = \alpha \cdot n \log n + \beta \cdot d \cdot n^2$$

where $\alpha$ captures per-service extraction cost and $\beta$ reflects
integration testing overhead. Early analysis of Alpha Corp's dependency graph
puts $d \approx 0.15$, which is moderate — most of the coupling sits in the
payment pipeline.

## Current Architecture Snapshot

The monolith entry point funnels everything through a single router. A simplified
view of the request dispatch:

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

One of the first things we'll untangle is the `MetricsCollector` — it's tightly
coupled to every service and will need its own extraction.

## Next Steps

Over the next two weeks we'll conduct interviews with each team lead, review
existing architecture decision records, and produce a current-state systems map.
The first formal deliverable — the Architecture Audit Report — is targeted for
early February.
