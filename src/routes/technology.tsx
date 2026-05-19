import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/technology")({
  component: () => <Navigate to="/nsphere" replace />,
});
