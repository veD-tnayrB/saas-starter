"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IAction {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface IActionsSelectorProps {
  actions: IAction[];
  selectedActionIds: string[];
  onSelectionChange: (actionIds: string[]) => void;
}

export function ActionsSelector({
  actions,
  selectedActionIds,
  onSelectionChange,
}: IActionsSelectorProps) {
  function handleActionToggle(actionId: string, checked: boolean) {
    if (checked) {
      onSelectionChange([...selectedActionIds, actionId]);
    } else {
      onSelectionChange(selectedActionIds.filter((id) => id !== actionId));
    }
  }

  // Group actions by category
  const actionsByCategory = actions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = [];
      }
      acc[action.category]!.push(action);
      return acc;
    },
    {} as Record<string, IAction[]>,
  );

  const categorySections: React.ReactElement[] = [];

  for (const [category, categoryActions] of Object.entries(actionsByCategory)) {
    const actionItems: React.ReactElement[] = [];

    for (const action of categoryActions) {
      const isChecked = selectedActionIds.includes(action.id);
      actionItems.push(
        <div key={action.id} className="flex items-center space-x-2 py-1">
          <Checkbox
            id={`action-${action.id}`}
            checked={isChecked}
            onCheckedChange={(checked) =>
              handleActionToggle(action.id, checked === true)
            }
          />
          <Label
            htmlFor={`action-${action.id}`}
            className="text-sm font-normal cursor-pointer"
          >
            {action.name}
            <span className="text-muted-foreground ml-2 font-mono text-xs">
              ({action.slug})
            </span>
          </Label>
        </div>,
      );
    }

    categorySections.push(
      <div key={category} className="space-y-2">
        <h4 className="text-sm font-semibold capitalize">{category}</h4>
        <div className="space-y-1 pl-4">{actionItems}</div>
      </div>,
    );
  }

  return (
    <div className="space-y-4">
      <Label>Actions</Label>
      <ScrollArea className="h-64 rounded-md border p-4">
        <div className="space-y-4">
          {categorySections.length > 0 ? (
            categorySections
          ) : (
            <p className="text-muted-foreground text-sm">
              No actions available
            </p>
          )}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        {selectedActionIds.length} action(s) selected
      </p>
    </div>
  );
}





