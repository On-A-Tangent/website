+++
title = "Discovery & Current State Assessment"
date = 2026-02-01
+++

The first phase of the Beta Systems engagement focused on understanding the
current state of platform reliability. We spent two weeks embedded with the
on-call rotation, observing incident response in real time.

## Findings

The platform runs across three AWS regions with a Kubernetes-based deployment
pipeline. Monitoring is fragmented — a mix of CloudWatch, a self-hosted Prometheus
instance, and ad-hoc Datadog dashboards with no consistent alerting strategy.
Mean time to detection for P1 incidents currently sits at around 23 minutes.

## Pain Points

The on-call team flagged alert fatigue as their top concern. Over 60% of pages
in the last quarter were false positives or low-severity events routed to the
wrong escalation path. Runbooks exist but are outdated and scattered across
Confluence and a shared Google Drive.

## SLO Framework

We're proposing SLOs built around an error budget model. For a target availability
of $A$ over a rolling window of $T$ seconds, the error budget $B$ is:

$$B = (1 - A) \cdot T$$

For their Tier 1 API with a 99.95% target over 30 days, that gives
$B = 0.0005 \times 2{,}592{,}000 = 1{,}296$ seconds — roughly 21.6 minutes of
total downtime per month. Current MTTD alone nearly exhausts that.

We can decompose availability into detection and recovery components:

$$
\begin{align}
A_{\text{effective}} &= 1 - \frac{\text{MTTD} + \text{MTTR}}{\text{MTBF}} \\\\
&= 1 - \frac{23 + 45}{43{,}200} \\\\
&\approx 0.9984
\end{align}
$$

which falls short of the 99.95% target by roughly a factor of three on the
downtime budget.

## Alert Routing Audit

We pulled the existing Prometheus alerting rules and found overlapping matchers
causing duplicate pages. Here's a representative example:

```yaml
groups:
  - name: api-latency
    rules:
      - alert: HighP99Latency
        expr: |
          histogram_quantile(0.99,
            rate(http_request_duration_seconds_bucket{job="api"}[5m])
          ) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "P99 latency above 500ms for {{ $labels.instance }}"

      - alert: HighP99LatencyCritical
        expr: |
          histogram_quantile(0.99,
            rate(http_request_duration_seconds_bucket{job="api"}[5m])
          ) > 2.0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "P99 latency above 2s for {{ $labels.instance }}"
```

The `warning` and `critical` alerts fire independently with no inhibition rules,
which means on-call engineers get paged twice for the same underlying issue.

## Recommendations Preview

Our initial direction centres on consolidating observability onto a single stack,
defining SLOs tied to business metrics, and building an automated incident
classification layer. Full recommendations will follow in the next post.
