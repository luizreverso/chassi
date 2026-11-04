---
name: scoping-estimation
description: Calculate PERT expected task hours and generate risk-weighted project quotes and milestone estimates.
---

# Scoping & Estimation Skill

Calculates risk-weighted PERT expected hours ($E = \frac{O + 4M + P}{6}$), standard deviation ($\sigma = \frac{P - O}{6}$), and budget projections.

## CLI Usage

```bash
# Print sample estimate table
python3 .agents/skills/scoping-estimation/estimate-calc.py --sample

# Calculate with high risk buffer (35%) and rate
python3 .agents/skills/scoping-estimation/estimate-calc.py --sample --risk high --rate 150

# Calculate from a JSON tasks file
python3 .agents/skills/scoping-estimation/estimate-calc.py --file tasks.json --risk medium --rate 150
```

## Python Engine
The calculation script is located at:
[`.agents/skills/scoping-estimation/estimate-calc.py`](file:///.agents/skills/scoping-estimation/estimate-calc.py)
