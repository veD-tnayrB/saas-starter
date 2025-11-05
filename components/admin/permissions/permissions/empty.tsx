"use client";

import { Card, CardContent } from "@/components/ui/card";

export function PermissionsEmpty() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          Please select a plan to view permissions
        </div>
      </CardContent>
    </Card>
  );
}


