package commands

import (
	"context"
	"fmt"

	"lesiw.io/command"
	"lesiw.io/command/sys"
)

func (Ops) Test() error {
	ctx := context.Background()
	sh := command.Shell(sys.Machine(), "bun")

	if err := sh.Exec(ctx, "bun", "test"); err != nil {
		return fmt.Errorf("bun test: %w", err)
	}

	return nil
}
