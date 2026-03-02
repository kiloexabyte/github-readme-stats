package commands

import (
	"context"
	"fmt"

	"lesiw.io/command"
	"lesiw.io/command/sys"
	"lesiw.io/fs"
)

func (Ops) Lint() error {
	ctx := context.Background()
	sh := command.Shell(sys.Machine(), "golangci-lint", "go", "bun")

	opsCtx := fs.WithWorkDir(ctx, ".ops")

	if err := sh.Exec(opsCtx, "golangci-lint", "run"); err != nil {
		return fmt.Errorf("golangci-lint: %w", err)
	}

	if err := sh.Exec(opsCtx, "go", "fmt"); err != nil {
		return fmt.Errorf("go fmt: %w", err)
	}

	if err := sh.Exec(ctx, "bun", "lint"); err != nil {
		return fmt.Errorf("bun lint: %w", err)
	}

	if err := sh.Exec(ctx, "bun", "format:check"); err != nil {
		return fmt.Errorf("bun format:check: %w", err)
	}

	if err := sh.Exec(ctx, "bun", "typecheck"); err != nil {
		return fmt.Errorf("bun typecheck: %w", err)
	}

	return nil
}