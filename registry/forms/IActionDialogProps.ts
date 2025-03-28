
export interface IActionDialogProps {
  title?: string | null;
  message?: string | null;
  icon?: string | null;
  iconColor?: string | null;
  btns: { [code: string]: string };
  close?: string | null;
}