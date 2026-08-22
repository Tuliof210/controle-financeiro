import { createElement } from "react";
import { type CardProps, useCard } from "./hook.ts";

export function Card(props: CardProps) {
  const { Tag, cardProps, children } = useCard(props);

  return createElement(Tag, cardProps, children);
}
