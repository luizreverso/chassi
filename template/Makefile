# Chassi — Project-Agnostic AI Development Backbone
# Run 'make help' for usage instructions.

SHELL := /usr/bin/env bash

.PHONY: help decide guard ast-test ast-scan secrets graph-build graph-update graph-query work-new estimate test

help:
	@echo ""
	@echo "🛠️  Chassi AI Backbone Commands"
	@echo "=================================================="
	@echo "  make decide [route=\"...\"] [drift=...] [file=...]  - Run System-1 Model & Effort Decision Gate"
	@echo "  make guard                                        - Run domain, ontology & architecture guard"
	@echo "  make ast-test                                     - Run ast-grep test suite against rule fixtures"
	@echo "  make ast-scan                                     - Scan codebase with ast-grep rules"
	@echo "  make secrets [full=1]                             - Scan for plaintext credentials & secret leaks"
	@echo "  make graph-build                                  - Build Graphify AST code topology graph"
	@echo "  make graph-update                                 - Incrementally update Graphify topology graph"
	@echo "  make graph-query [q=\"...\"]                        - Query Graphify architectural graph"
	@echo "  make work-new name=feature_name                   - Scaffold new work package & feature branch"
	@echo "  make estimate [risk=medium rate=150]              - Calculate risk-weighted PERT estimates"
	@echo "  make test                                         - Run guard, AST tests, and System-1 router check"
	@echo "=================================================="
	@echo ""

decide:
ifdef route
	@node ./scripts/decide.mjs --route "$(route)"
else ifdef drift
	@node ./scripts/decide.mjs --drift --file "$(drift)"
else ifdef file
	@node ./scripts/decide.mjs --route --file "$(file)"
else
	@node ./scripts/decide.mjs --route "General development task"
endif

guard:
	@node ./scripts/domain-guard.mjs --full

ast-test:
	@PATH="$$HOME/.local/bin:$$PATH" ast-grep test --skip-snapshot-tests

ast-scan:
	@PATH="$$HOME/.local/bin:$$PATH" ast-grep scan

secrets:
ifdef full
	@node ./scripts/scan-secrets.mjs --full
else
	@node ./scripts/scan-secrets.mjs
endif

graph-build:
	@rm -rf graphify-out
	@PATH="$$HOME/.local/bin:$$PATH" graphify extract . --code-only
	@PATH="$$HOME/.local/bin:$$PATH" GRAPHIFY_BACKEND=none graphify cluster-only .

graph-update:
	@PATH="$$HOME/.local/bin:$$PATH" graphify update .
	@PATH="$$HOME/.local/bin:$$PATH" GRAPHIFY_BACKEND=none graphify cluster-only .

graph-query:
ifdef q
	@PATH="$$HOME/.local/bin:$$PATH" graphify query "$(q)"
else
	@PATH="$$HOME/.local/bin:$$PATH" graphify query
endif

work-new:
ifndef name
	@echo "❌ Error: Specify work name, e.g.: make work-new name=stripe_billing_portal"
	@exit 1
else
	@node ./scripts/new-work.mjs $(name)
endif

estimate:
	@python3 ./.agents/skills/scoping-estimation/estimate-calc.py --sample --risk $(or $(risk),medium) $(if $(rate),--rate $(rate),)

test: guard ast-test
	@node ./scripts/decide.mjs --route "Smoke test" > /dev/null
	@echo "✔ All Chassi baseline checks passed."
