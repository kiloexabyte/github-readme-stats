package composite

func (o Ops) Ci() error {
	if err := o.Install(); err != nil {
		return err
	}

	if err := o.Lint(); err != nil {
		return err
	}

	if err := o.Test(); err != nil {
		return err
	}

	return nil
}
