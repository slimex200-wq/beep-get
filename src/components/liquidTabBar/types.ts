import type React from "react";

export type IconComponent = (props: { readonly color?: string }) => React.ReactNode;

export type TabVisual = {
  readonly label: string;
  readonly Icon: IconComponent;
};

export type SecondaryAction = {
  readonly key: string;
  readonly label: string;
  readonly screen: "Logs" | "Account" | "Dictionary";
  readonly Icon: IconComponent;
};
