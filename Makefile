# 90-Hard Project Makefile
# Using bun for speed and efficiency

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
RESET := \033[0m

# Default shell
SHELL := /bin/bash

# Detect OS for platform-specific commands
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    KILL_PORT_CMD = lsof -ti:$$port | xargs kill -9 2>/dev/null || true
else
    KILL_PORT_CMD = fuser -k $$port/tcp 2>/dev/null || true
endif

# Common development ports
DEV_PORTS := 3000 8081 8082 19000 19001

# Default target
.DEFAULT_GOAL := help

##@ General

.PHONY: help
help: ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\n${CYAN}Usage:${RESET}\n  make ${GREEN}<target>${RESET}\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  ${GREEN}%-20s${RESET} %s\n", $$1, $$2 } /^##@/ { printf "\n${YELLOW}%s${RESET}\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation & Setup

.PHONY: install
install: ## Install dependencies with bun
	@echo "${CYAN}Installing dependencies with bun...${RESET}"
	@bun install
	@echo "${GREEN}✓ Dependencies installed${RESET}"

.PHONY: prepare
prepare: ## Prepare git hooks
	@echo "${CYAN}Setting up git hooks...${RESET}"
	@bun run prepare
	@echo "${GREEN}✓ Git hooks configured${RESET}"

##@ Development

.PHONY: dev
dev: kill-ports ## Kill ports and run development (web + mobile)
	@echo "${CYAN}Starting development servers...${RESET}"
	@bun run dev

.PHONY: dev-web
dev-web: ## Kill port 3000 and run Next.js only
	@echo "${CYAN}Killing port 3000...${RESET}"
	@for port in 3000; do \
		$(KILL_PORT_CMD); \
	done
	@echo "${CYAN}Starting Next.js...${RESET}"
	@bun run dev:web

.PHONY: dev-mobile
dev-mobile: ## Kill port 8081 and run Expo only
	@echo "${CYAN}Killing port 8081...${RESET}"
	@for port in 8081; do \
		$(KILL_PORT_CMD); \
	done
	@echo "${CYAN}Starting Expo...${RESET}"
	@bun run dev:mobile

.PHONY: ios
ios: ## Run iOS simulator
	@echo "${CYAN}Starting iOS simulator...${RESET}"
	@bun run ios

.PHONY: android
android: ## Run Android emulator
	@echo "${CYAN}Starting Android emulator...${RESET}"
	@bun run android

##@ Testing

.PHONY: test
test: ## Run all tests with bun
	@echo "${CYAN}Running tests...${RESET}"
	@bun run test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "${CYAN}Running tests in watch mode...${RESET}"
	@bun run test:watch

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "${CYAN}Running tests with coverage...${RESET}"
	@bun run test:coverage

.PHONY: test-all
test-all: ## Full test suite with coverage (unit + e2e)
	@echo "${CYAN}Running full test suite...${RESET}"
	@bun run test:coverage
	@bun run test:e2e
	@echo "${GREEN}✓ All tests completed${RESET}"

.PHONY: test-ui
test-ui: ## Open Vitest UI
	@echo "${CYAN}Opening Vitest UI...${RESET}"
	@bun run test:ui

.PHONY: test-echo
test-echo: ## Run tests with browser echo
	@echo "${CYAN}Running tests with browser echo...${RESET}"
	@bun run test:echo

.PHONY: e2e
e2e: ## Run E2E tests
	@echo "${CYAN}Running E2E tests...${RESET}"
	@bun run test:e2e

.PHONY: e2e-ui
e2e-ui: ## Run E2E tests with UI
	@echo "${CYAN}Opening Playwright UI...${RESET}"
	@bun run test:e2e:ui

.PHONY: e2e-debug
e2e-debug: ## Debug E2E tests
	@echo "${CYAN}Running E2E tests in debug mode...${RESET}"
	@bun run test:e2e:debug

.PHONY: e2e-headed
e2e-headed: ## Run E2E tests in headed browser
	@echo "${CYAN}Running E2E tests in headed mode...${RESET}"
	@bun run test:e2e:headed

.PHONY: e2e-report
e2e-report: ## Show E2E test report
	@echo "${CYAN}Opening E2E test report...${RESET}"
	@bun run test:e2e:report

##@ Building

.PHONY: build
build: ## Build all apps
	@echo "${CYAN}Building all apps...${RESET}"
	@bun run build
	@echo "${GREEN}✓ Build completed${RESET}"

.PHONY: build-preview
build-preview: ## Build and preview Next.js
	@echo "${CYAN}Building and previewing Next.js...${RESET}"
	@bun run build:preview

.PHONY: build-schema
build-schema: ## Rebuild GraphQL schema
	@echo "${CYAN}Rebuilding GraphQL schema...${RESET}"
	@bun run build:schema
	@echo "${GREEN}✓ Schema rebuilt${RESET}"

##@ Code Quality

.PHONY: lint
lint: ## Run linting
	@echo "${CYAN}Running linter...${RESET}"
	@bunx biome check --files-ignore-unknown=true
	@echo "${GREEN}✓ Linting completed${RESET}"

.PHONY: format
format: ## Format code
	@echo "${CYAN}Formatting code...${RESET}"
	@bunx biome format --write --files-ignore-unknown=true
	@echo "${GREEN}✓ Code formatted${RESET}"

.PHONY: lint-fix
lint-fix: ## Fix linting issues
	@echo "${CYAN}Fixing linting issues...${RESET}"
	@bunx biome check --write --files-ignore-unknown=true
	@echo "${GREEN}✓ Linting issues fixed${RESET}"

##@ Code Generation

.PHONY: gen-schema
gen-schema: ## Create new Zod schema with GraphQL types
	@echo "${CYAN}Generating new schema...${RESET}"
	@bun run add:schema

.PHONY: gen-resolver
gen-resolver: ## Create new GraphQL resolver
	@echo "${CYAN}Generating new resolver...${RESET}"
	@bun run add:resolver

.PHONY: gen-route
gen-route: ## Create new universal route
	@echo "${CYAN}Generating new route...${RESET}"
	@bun run add:route

.PHONY: gen-form
gen-form: ## Generate form from schema
	@echo "${CYAN}Generating form...${RESET}"
	@bun run add:form

.PHONY: link-routes
link-routes: ## Link routes between apps
	@echo "${CYAN}Linking routes...${RESET}"
	@bun run link:routes
	@echo "${GREEN}✓ Routes linked${RESET}"

##@ Maintenance

.PHONY: clean
clean: ## Clean all node_modules and build artifacts
	@echo "${RED}Cleaning project...${RESET}"
	@echo "Removing node_modules..."
	@find . -name "node_modules" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	@echo "Removing build artifacts..."
	@find . -name ".next" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	@find . -name ".expo" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	@find . -name ".turbo" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	@find . -name "dist" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	@find . -name "build" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	@find . -name "coverage" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
	@rm -rf .parcel-cache 2>/dev/null || true
	@echo "${GREEN}✓ Project cleaned${RESET}"

.PHONY: clean-cache
clean-cache: ## Clean turbo and other caches
	@echo "${CYAN}Cleaning caches...${RESET}"
	@bunx turbo daemon clean
	@rm -rf .turbo 2>/dev/null || true
	@rm -rf .next 2>/dev/null || true
	@rm -rf .expo 2>/dev/null || true
	@echo "${GREEN}✓ Caches cleaned${RESET}"

.PHONY: kill-ports
kill-ports: ## Kill all common dev ports (3000, 8081, 8082, 19000, 19001)
	@echo "${CYAN}Killing development ports...${RESET}"
	@for port in $(DEV_PORTS); do \
		echo "Checking port $$port..."; \
		$(KILL_PORT_CMD); \
	done
	@echo "${GREEN}✓ Ports cleared${RESET}"

.PHONY: check-ports
check-ports: ## Check which dev ports are in use
	@echo "${CYAN}Checking development ports...${RESET}"
	@for port in $(DEV_PORTS); do \
		if lsof -Pi :$$port -sTCP:LISTEN -t >/dev/null 2>&1; then \
			echo "${RED}Port $$port is in use${RESET}"; \
			lsof -Pi :$$port -sTCP:LISTEN; \
		else \
			echo "${GREEN}Port $$port is free${RESET}"; \
		fi; \
	done

##@ Utilities

.PHONY: env-local
env-local: ## Setup local environment
	@echo "${CYAN}Setting up local environment...${RESET}"
	@bun run env:local
	@echo "${GREEN}✓ Environment configured${RESET}"

.PHONY: postinstall
postinstall: ## Run postinstall scripts
	@echo "${CYAN}Running postinstall scripts...${RESET}"
	@bun run postinstall
	@echo "${GREEN}✓ Postinstall completed${RESET}"

.PHONY: turbo-login
turbo-login: ## Login to Turbo
	@echo "${CYAN}Logging in to Turbo...${RESET}"
	@bun run turbo:login

.PHONY: turbo-link
turbo-link: ## Link Turbo project
	@echo "${CYAN}Linking Turbo project...${RESET}"
	@bun run turbo:link

##@ Quick Commands

.PHONY: fresh
fresh: clean install prepare ## Fresh install (clean + install + prepare)
	@echo "${GREEN}✓ Fresh install completed${RESET}"

.PHONY: restart
restart: kill-ports dev ## Kill ports and restart development

.PHONY: check
check: lint test ## Run linting and tests

.PHONY: ci
ci: install lint test-coverage e2e ## Run full CI pipeline
	@echo "${GREEN}✓ CI pipeline completed${RESET}"