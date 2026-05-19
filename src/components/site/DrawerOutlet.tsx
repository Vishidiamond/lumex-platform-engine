import { Outlet, useRouterState } from "@tanstack/react-router";
import { Drawer } from "./Drawer";

export function DrawerOutlet() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isOpen = pathname !== "/";
  return (
    <Drawer isOpen={isOpen}>
      <Outlet />
    </Drawer>
  );
}
