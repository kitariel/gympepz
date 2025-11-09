"use client";
import * as React from "react";
import { ChevronRight, GripVertical, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { GroupSettingsPopover } from "@/components/sidebar/GroupSettingsPopover";
import { ChildLabelEditorPopover } from "@/components/sidebar/ChildLabelEditorPopover";
import type { MenuItem, MenuChild } from "@/types/menu";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

// Define a local type to mirror the items prop for better type inference
type SidebarNavItem = MenuItem & { icon: LucideIcon };

// Provide sortable attributes/listeners to nested handle components
const SortableItemContext = React.createContext<{
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
} | null>(null);

const SortableParent: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "cursor-grabbing shadow-sm" : "cursor-auto"}
    >
      <SortableItemContext.Provider value={{ attributes, listeners }}>
        {children}
      </SortableItemContext.Provider>
    </SidebarMenuItem>
  );
};

const SortableChild: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <SidebarMenuSubItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "cursor-grabbing shadow-sm" : "cursor-auto"}
    >
      <SortableItemContext.Provider value={{ attributes, listeners }}>
        {children}
      </SortableItemContext.Provider>
    </SidebarMenuSubItem>
  );
};

// Drag handle components that activate dragging only from the handle
const ParentDragHandle: React.FC<{ className?: string }> = ({ className }) => {
  const sortable = React.useContext(SortableItemContext);
  if (!sortable) return null;
  const { listeners, attributes } = sortable;
  return (
    <SidebarMenuAction
      {...attributes}
      {...listeners}
      className={cn(
        "absolute right-7 flex h-6 w-6 cursor-grab items-center justify-center p-0 active:cursor-grabbing",
        className,
      )}
    >
      <GripVertical className="h-4 w-4" />
      <span className="sr-only">Drag</span>
    </SidebarMenuAction>
  );
};

const ChildDragHandle: React.FC<{ className?: string }> = ({ className }) => {
  const sortable = React.useContext(SortableItemContext);
  if (!sortable) return null;
  const { listeners, attributes } = sortable;
  return (
    <SidebarMenuAction
      {...attributes}
      {...listeners}
      className={cn(
        "absolute right-7 flex h-6 w-6 cursor-grab items-center justify-center p-0 active:cursor-grabbing",
        className,
      )}
    >
      <GripVertical className="h-4 w-4" />
      <span className="sr-only">Drag child</span>
    </SidebarMenuAction>
  );
};

export function NavMain({
  items,
  onAddChild,
  isAddingChild,
  onUpdateParentLabel,
  onUpdateChildLabel,
  onReorderParents,
  onReorderChildren,
  isUpdatingParentLabel,
  isUpdatingChildLabel,
  onRemoveParent,
  onRemoveChild,
  isRemovingParent,
  isRemovingChild,
}: {
  items: (Omit<MenuItem, "title"> & { title: string } & { icon: LucideIcon })[];
  onAddChild: (parentTitle: string, label: string) => void;
  isAddingChild?: boolean;
  onUpdateParentLabel: (oldTitle: string, newTitle: string) => void;
  onUpdateChildLabel: (
    parentTitle: string,
    oldTitle: string,
    newTitle: string,
  ) => void;
  onReorderParents: (orderedTitles: string[]) => void;
  onReorderChildren: (parentTitle: string, orderedTitles: string[]) => void;
  isUpdatingParentLabel?: boolean;
  isUpdatingChildLabel?: boolean;
  onRemoveParent: (title: string) => void;
  onRemoveChild: (parentTitle: string, childTitle: string) => void;
  isRemovingParent?: boolean;
  isRemovingChild?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );
  // Local optimistic state: mirror items so UI updates immediately
  const [localItems, setLocalItems] = React.useState<SidebarNavItem[]>(items);
  React.useEffect(() => {
    setLocalItems(items as SidebarNavItem[]);
  }, [items]);
  const handleAddChildLocal = React.useCallback(
    (parentTitle: string, label: string) => {
      setLocalItems((prev: SidebarNavItem[]) => {
        const next: SidebarNavItem[] = [...prev];
        const idx = next.findIndex((p) => p.title === parentTitle);
        if (idx === -1) return prev;
        const parent = next[idx];
        if (!parent) return prev;
        const children: MenuChild[] = [...(parent.items ?? [])];
        children.push({ title: label, url: "#" });
        next[idx] = { ...parent, items: children };
        return next;
      });
      onAddChild(parentTitle, label);
    },
    [onAddChild],
  );

  const handleUpdateParentLabelLocal = React.useCallback(
    (oldTitle: string, newTitle: string) => {
      setLocalItems((prev) =>
        prev.map((p) => (p.title === oldTitle ? { ...p, title: newTitle } : p)),
      );
      onUpdateParentLabel(oldTitle, newTitle);
    },
    [onUpdateParentLabel],
  );

  const handleUpdateChildLabelLocal = React.useCallback(
    (parentTitle: string, oldTitle: string, newTitle: string) => {
      setLocalItems((prev) => {
        const next = prev.map((p) => {
          if (p.title !== parentTitle) return p;
          const updatedChildren = (p.items ?? []).map((c) =>
            c.title === oldTitle ? { ...c, title: newTitle } : c,
          );
          return { ...p, items: updatedChildren };
        });
        return next;
      });
      onUpdateChildLabel(parentTitle, oldTitle, newTitle);
    },
    [onUpdateChildLabel],
  );

  const handleRemoveParentLocal = React.useCallback((title: string) => {
    setLocalItems((prev) => prev.filter((p) => p.title !== title));
    onRemoveParent(title);
  }, [onRemoveParent]);

  const handleRemoveChildLocal = React.useCallback((parentTitle: string, childTitle: string) => {
    setLocalItems((prev) => {
      return prev.map((p) => {
        if (p.title !== parentTitle) return p;
        const updatedChildren = (p.items ?? []).filter((c) => c.title !== childTitle);
        return { ...p, items: updatedChildren };
      });
    });
    onRemoveChild(parentTitle, childTitle);
  }, [onRemoveChild]);

  const handleParentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const ids = localItems.map((i) => i.title);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    const newOrder = arrayMove(ids, oldIndex, newIndex);
    // Optimistically update local state to reflect new parent order
    setLocalItems((prev: SidebarNavItem[]) => {
      const entries: [string, SidebarNavItem][] = prev.map((i) => [i.title, i]);
      const byTitle = new Map(entries);
      const reordered = newOrder
        .map((t: string) => byTitle.get(t))
        .filter(Boolean) as SidebarNavItem[];
      return reordered;
    });
    onReorderParents(newOrder);
  };
  const handleChildDragEnd = (event: DragEndEvent, parentTitle: string) => {
    const { active, over } = event;
    if (!over) return;
    const parentIndex = localItems.findIndex((i) => i.title === parentTitle);
    if (parentIndex === -1) return;
    const ids = (localItems[parentIndex]?.items ?? []).map((i) => i.title);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    const newOrder = arrayMove(ids, oldIndex, newIndex);
    // Optimistically update local state to reflect new child order
    setLocalItems((prev: SidebarNavItem[]) => {
      const next: SidebarNavItem[] = [...prev];
      const parent = next[parentIndex];
      if (!parent) return prev;
      const entries: [string, MenuChild][] = (parent.items ?? []).map((i) => [
        i.title,
        i,
      ]);
      const childMap = new Map(entries);
      const reorderedChildren = newOrder
        .map((t: string) => childMap.get(t))
        .filter(Boolean) as MenuChild[];
      next[parentIndex] = { ...parent, items: reorderedChildren };
      return next;
    });
    onReorderChildren(parentTitle, newOrder);
  };

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <DndContext sensors={sensors} onDragEnd={handleParentDragEnd}>
        <SortableContext
          items={localItems.map((i) => i.title)}
          strategy={verticalListSortingStrategy}
        >
          <SidebarMenu>
            {localItems.map((item, index) => {
              return (
                <Collapsible
                  key={item.title + index}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SortableParent id={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a
                        href={item.url ?? "#"}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {/* Actions always visible; chevron/collapsible only when children exist */}

                    {/** Always show settings and drag handle; only chevron appears if there are children */}
                    <GroupSettingsPopover
                      parentTitle={item.title}
                      onUpdateLabel={handleUpdateParentLabelLocal}
                      isUpdating={Boolean(isUpdatingParentLabel)}
                      onAddChild={(label: string) =>
                        handleAddChildLocal(item.title, label)
                      }
                      isAddingChild={isAddingChild}
                      onRemoveParent={handleRemoveParentLocal}
                      isRemovingParent={Boolean(isRemovingParent)}
                      hasChildren={Boolean(item.items && item.items.length > 0)}
                      actionClassName="right-14"
                    />
                    <ParentDragHandle className="right-7" />
                    {item.items && item.items.length > 0 ? (
                      <React.Fragment>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRight />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <DndContext
                            sensors={sensors}
                            onDragEnd={(e) => handleChildDragEnd(e, item.title)}
                          >
                            <SortableContext
                              items={(item.items ?? []).map((i) => i.title)}
                              strategy={verticalListSortingStrategy}
                            >
                              <SidebarMenuSub>
                                {item.items?.map((subItem, index) => {
                                  return (
                                    <SortableChild
                                      key={subItem.title + index}
                                      id={subItem.title}
                                    >
                                      <SidebarMenuSubButton asChild>
                                        <a
                                          href={subItem.url}
                                          onPointerDownCapture={(e) =>
                                            e.stopPropagation()
                                          }
                                        >
                                          <span>{subItem.title}</span>
                                        </a>
                                      </SidebarMenuSubButton>
                                      <ChildLabelEditorPopover
                                        childLabel={subItem.title}
                                        onUpdateLabel={(oldLabel, newLabel) =>
                                          handleUpdateChildLabelLocal(
                                            item.title,
                                            oldLabel,
                                            newLabel,
                                          )
                                        }
                                        isUpdating={Boolean(
                                          isUpdatingChildLabel,
                                        )}
                                        onRemoveChild={(label) =>
                                          handleRemoveChildLocal(
                                            item.title,
                                            label,
                                          )
                                        }
                                        isRemovingChild={Boolean(isRemovingChild)}
                                        actionClassName="right-14"
                                      />
                                      <ChildDragHandle className="right-7" />
                                    </SortableChild>
                                  );
                                })}
                              </SidebarMenuSub>
                            </SortableContext>
                          </DndContext>
                        </CollapsibleContent>
                      </React.Fragment>
                    ) : null}
                  </SortableParent>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SortableContext>
      </DndContext>
    </SidebarGroup>
  );
}
