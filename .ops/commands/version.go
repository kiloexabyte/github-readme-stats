package commands

import (
	"context"

	"lesiw.io/command"
	"lesiw.io/command/sys"
)

func (Ops) Version() error {
	ctx := context.Background()
	sh := command.Shell(sys.Machine(), "go")

	return sh.Exec(ctx, "go", "--version")
}