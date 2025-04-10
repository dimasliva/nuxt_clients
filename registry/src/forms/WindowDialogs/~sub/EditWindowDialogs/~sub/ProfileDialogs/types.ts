import type { Container } from "inversify";
import { type IEditFormProps } from '~/src/forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';

export interface IProfileDialogProps extends IEditFormProps {
  diC?: Container,
  recKey: string | null;
  readonly?: boolean;
}
