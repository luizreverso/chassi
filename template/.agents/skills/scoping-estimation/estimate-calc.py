#!/usr/bin/env python3
"""
Scoping & Estimation Calculator
Calculates PERT Expected Hours (E = (O + 4M + P) / 6), risk-weighted buffers, and quote totals.

Usage:
    python3 estimate-calc.py --sample
    python3 estimate-calc.py --sample --risk high --rate 150
    python3 estimate-calc.py --file tasks.json --risk medium --rate 150
"""

import sys
import json
import argparse

def calculate_pert(optimistic: float, realistic: float, pessimistic: float) -> float:
    return (optimistic + (4.0 * realistic) + pessimistic) / 6.0

def generate_table(tasks, risk_level="medium", hourly_rate=None):
    risk_multipliers = {
        "low": 0.10,
        "medium": 0.20,
        "high": 0.35
    }
    buffer_pct = risk_multipliers.get(risk_level.lower(), 0.20)

    total_low = 0.0
    total_med = 0.0
    total_high = 0.0
    total_expected = 0.0

    output = []
    output.append("| Task / Component | Description | Low (h) | Med (h) | High (h) | Expected (h) |")
    output.append("| :--- | :--- | :--- | :--- | :--- | :--- |")

    for task in tasks:
        if isinstance(task, (list, tuple)):
            name, desc, low, med, high = task[0], task[1], float(task[2]), float(task[3]), float(task[4])
        elif isinstance(task, dict):
            name = task.get("name", "Task")
            desc = task.get("description", "")
            low = float(task.get("low", 0.0))
            med = float(task.get("med", 0.0))
            high = float(task.get("high", 0.0))
        else:
            continue

        expected = calculate_pert(low, med, high)
        total_low += low
        total_med += med
        total_high += high
        total_expected += expected
        output.append(f"| **{name}** | {desc} | {low:.1f} | {med:.1f} | {high:.1f} | {expected:.1f} |")

    buffer_hours = total_expected * buffer_pct
    grand_total_hours = total_expected + buffer_hours

    output.append(f"| **Subtotal** | | {total_low:.1f} | {total_med:.1f} | {total_high:.1f} | {total_expected:.1f} |")
    output.append(f"| **Risk Buffer ({int(buffer_pct * 100)}%)** | Contingency buffer ({risk_level.capitalize()} risk profile) | | | | +{buffer_hours:.1f}h |")
    output.append(f"| **Total Scope Estimate** | | | | | **~{round(grand_total_hours)} hours** |")

    if hourly_rate:
        projected_cost = grand_total_hours * hourly_rate
        output.append(f"| **Estimated Budget** | Hourly rate @ ${hourly_rate:.2f}/hr | | | | **${projected_cost:,.2f}** |")

    return "\n".join(output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PERT Estimation Calculator")
    parser.add_argument("--risk", choices=["low", "medium", "high"], default="medium", help="Risk buffer profile")
    parser.add_argument("--rate", type=float, default=None, help="Hourly billing rate")
    parser.add_argument("--sample", action="store_true", help="Print sample estimate table")
    parser.add_argument("--file", type=str, help="JSON file containing task breakdown list")
    args = parser.parse_args()

    sample_tasks = [
        ("Phase 0: Discovery & Setup", "Repo config, local environment, credential setup", 2.0, 4.0, 6.0),
        ("Phase 1: Architecture & Schema", "Data models, Zod schemas, API interface contracts", 4.0, 6.0, 10.0),
        ("Phase 2: Core Vertical Slice", "Implementation of domain logic and primary UI flow", 8.0, 12.0, 18.0),
        ("Phase 3: Automated QA & Integration", "Integration tests, edge case assertions, failure handling", 4.0, 6.0, 8.0),
        ("Phase 4: Review & Deployment", "Staging verification, production cutover, documentation", 2.0, 4.0, 6.0),
    ]

    tasks_to_render = []
    if args.file:
        try:
            with open(args.file, "r", encoding="utf-8") as f:
                tasks_to_render = json.load(f)
        except Exception as e:
            sys.stderr.write(f"Error loading tasks file {args.file}: {e}\n")
            sys.exit(1)
    elif args.sample:
        tasks_to_render = sample_tasks
    else:
        parser.print_help()
        sys.exit(0)

    print(f"\n### Project Estimation (Risk: {args.risk.capitalize()})\n")
    print(generate_table(tasks_to_render, risk_level=args.risk, hourly_rate=args.rate))
    print("")
