"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ActionsManagement } from "./actions/management";
import { PermissionsManagement } from "./permissions/management";
import { PlansManagement } from "./plans/management";
import { RolesManagement } from "./roles/management";

export function PermissionsDashboardClient() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="actions">Actions</TabsTrigger>
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>

      <TabsContent value="roles" className="mt-6">
        <RolesManagement />
      </TabsContent>

      <TabsContent value="actions" className="mt-6">
        <ActionsManagement />
      </TabsContent>

      <TabsContent value="plans" className="mt-6">
        <PlansManagement />
      </TabsContent>

      <TabsContent value="permissions" className="mt-6">
        <PermissionsManagement />
      </TabsContent>
    </Tabs>
  );
}
