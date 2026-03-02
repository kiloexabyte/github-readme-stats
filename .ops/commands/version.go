package commands

import (
	"context"
	"fmt"

	"lesiw.io/command"
	"lesiw.io/command/sys"
)

func (Ops) Version() error {
	ctx := context.Background()
	sh := command.Shell(sys.Machine(), "go", "bun")

	if err := sh.Exec(ctx, "go", "version"); err != nil {
		return fmt.Errorf("go version: %w", err)
	}

	if err := sh.Exec(ctx, "bun", "--version"); err != nil {
		return fmt.Errorf("bun version: %w", err)
	}

	return nil
}