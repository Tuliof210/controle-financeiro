import { createElement } from "react";
import { type CardProps, useCard } from "./hook.ts";

export function Card(props: CardProps) {
  const { tag, cardProps, children } = useCard(props);

  return createElement(tag, cardProps, children);
}
