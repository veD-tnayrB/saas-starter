import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProjectsEmpty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Projects</CardTitle>
        <CardDescription>
          You don&apos;t have any projects yet. A personal project will be
          created automatically when you complete registration.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
