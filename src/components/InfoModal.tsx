"use client";

import { ReactNode } from "react";
import Panel from "./Panel";

export default function InfoModal({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Panel onClose={onClose} label={label}>
      {children}
    </Panel>
  );
}
