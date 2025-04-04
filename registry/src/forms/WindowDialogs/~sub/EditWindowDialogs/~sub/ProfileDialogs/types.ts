import type { Container } from "inversify";

export interface IProfileDialogProps {
    diC?: Container,
    recKey: string | null;
    readonly?: boolean;
  }