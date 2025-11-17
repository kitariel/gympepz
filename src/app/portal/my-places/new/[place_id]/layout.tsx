import type { ReactNode } from "react";

export default function MyPlacesNewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
