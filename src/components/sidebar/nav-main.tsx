"use client";
import * as React from "react";
import { ChevronRight, GripVertical } from "lucide-react";

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
import type { MenuItem, MenuChild, IconPlatform } from "@/types/menu";

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
import * as Lucide from "lucide-react";
import * as HeroOutline from "@heroicons/react/24/outline";
import Link from "next/link";

// Unified icon type used in sidebar items
type SidebarIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type SidebarNavItem = MenuItem & { icon: SidebarIcon };

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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <SidebarMenuSubItem
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <SortableItemContext.Provider value={{ attributes, listeners }}>
        {children}
      </SortableItemContext.Provider>
    </SidebarMenuSubItem>
  );
};

const ParentDragHandle: React.FC<{ className?: string }> = ({ className }) => {
  const sortableCtx = React.useContext(SortableItemContext);
  const { attributes, listeners } = sortableCtx ?? {};
  return (
    <SidebarMenuAction
      className={cn("cursor-grab active:cursor-grabbing", className)}
      onPointerDown={(e) => e.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <GripVertical />
      <span className="sr-only">Move</span>
    </SidebarMenuAction>
  );
};

const ChildDragHandle: React.FC<{ className?: string }> = ({ className }) => {
  const sortableCtx = React.useContext(SortableItemContext);
  const { attributes, listeners } = sortableCtx ?? {};
  return (
    <SidebarMenuAction
      className={cn("cursor-grab active:cursor-grabbing", className)}
      onPointerDown={(e) => e.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <GripVertical />
      <span className="sr-only">Move</span>
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
  iconsByTitle,
  onUpdateParentIcon,
  // New URL update handlers
  onUpdateParentUrl,
  onUpdateChildUrl,
  enableEditing = true,
}: {
  items: (Omit<MenuItem, "title"> & { title: string } & {
    icon: SidebarIcon;
  })[];
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
  iconsByTitle?: Record<string, { name: string; platform: IconPlatform }>;
  onUpdateParentIcon: (
    title: string,
    iconName?: string,
    iconPlatform?: IconPlatform,
  ) => void;
  // New URL update handlers
  onUpdateParentUrl: (title: string, url: string) => void;
  onUpdateChildUrl: (
    parentTitle: string,
    childTitle: string,
    url: string,
  ) => void;
  // Global toggle: show/hide all editing UI (e.g., super admin mode)
  enableEditing?: boolean;
  // Future use: role-based filtering (not enforced yet)
  currentUserRoles?: string[];
}) {
  const sensors = useSensors(
    // Add activation constraint to avoid interfering with regular clicks
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const [localItems, setLocalItems] = React.useState<SidebarNavItem[]>(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Local wrappers for editing actions (optimistic UI)
  const handleAddChildLocal = React.useCallback(
    (parentTitle: string, label: string) => {
      setLocalItems((prev) => {
        const next = [...prev];
        const idx = next.findIndex((p) => p.title === parentTitle);
        if (idx === -1) return prev;
        const parent = next[idx]!;
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
        return prev.map((p) => {
          if (p.title !== parentTitle) return p;
          const updated = (p.items ?? []).map((c) =>
            c.title === oldTitle ? { ...c, title: newTitle } : c,
          );
          return { ...p, items: updated };
        });
      });
      onUpdateChildLabel(parentTitle, oldTitle, newTitle);
    },
    [onUpdateChildLabel],
  );

  const handleRemoveParentLocal = React.useCallback(
    (title: string) => {
      setLocalItems((prev) => prev.filter((p) => p.title !== title));
      onRemoveParent(title);
    },
    [onRemoveParent],
  );

  const handleRemoveChildLocal = React.useCallback(
    (parentTitle: string, childTitle: string) => {
      setLocalItems((prev) => {
        return prev.map((p) => {
          if (p.title !== parentTitle) return p;
          const updated = (p.items ?? []).filter((c) => c.title !== childTitle);
          return { ...p, items: updated };
        });
      });
      onRemoveChild(parentTitle, childTitle);
    },
    [onRemoveChild],
  );

  const handleParentDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = localItems.findIndex((i) => i.title === active.id);
      const newIndex = localItems.findIndex((i) => i.title === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(reordered);
      onReorderParents(reordered.map((i) => i.title));
    },
    [localItems, onReorderParents],
  );

  const handleChildDragEnd = React.useCallback(
    (event: DragEndEvent, parentTitle: string) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const parentIdx = localItems.findIndex((i) => i.title === parentTitle);
      if (parentIdx === -1) return;
      const parent = localItems[parentIdx]!;
      const items = parent.items ?? [];
      const oldIndex = items.findIndex((i) => i.title === active.id);
      const newIndex = items.findIndex((i) => i.title === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(items, oldIndex, newIndex);
      const nextParents = [...localItems];
      nextParents[parentIdx] = { ...parent, items: reordered };
      setLocalItems(nextParents);
      onReorderChildren(
        parentTitle,
        reordered.map((i) => i.title),
      );
    },
    [localItems, onReorderChildren],
  );

  // Visibility gating: if editing disabled, hide items where enabled === false
  const visibleParents = enableEditing
    ? localItems
    : localItems.filter((i) => i.enabled ?? true);

  return (
    <SidebarGroup>
      <DndContext sensors={sensors} onDragEnd={handleParentDragEnd}>
        <SortableContext
          items={visibleParents.map((i) => i.title)}
          strategy={verticalListSortingStrategy}
        >
          <SidebarMenu>
            {visibleParents.map((item, index) => {
              const visibleChildren = enableEditing
                ? (item.items ?? [])
                : (item.items ?? []).filter((c) => c.enabled ?? true);
              return (
                <Collapsible
                  key={item.title + index}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SortableParent id={item.title}>
                    {visibleChildren.length > 0 ? (
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <button type="button">
                            {(() => {
                              const mapping = iconsByTitle?.[item.title];
                              if (mapping) {
                                const { name, platform } = mapping;
                                if (platform === "heroicons") {
                                  const Outline =
                                    HeroOutline as unknown as Record<
                                      string,
                                      HeroIcon
                                    >;
                                  const DynamicIcon: SidebarIcon =
                                    Outline[name] ?? item.icon;
                                  return <DynamicIcon className="size-4" />;
                                } else {
                                  const LucideIcons =
                                    Lucide as unknown as Record<
                                      string,
                                      import("lucide-react").LucideIcon
                                    >;
                                  const DynamicIcon: SidebarIcon =
                                    LucideIcons[name] ?? item.icon;
                                  return <DynamicIcon className="size-4" />;
                                }
                              }
                              const Fallback = item.icon;
                              return <Fallback className="size-4" />;
                            })()}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    ) : (
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link
                          href={item.url ?? "#"}
                          onPointerDownCapture={(e) => e.stopPropagation()}
                        >
                          {(() => {
                            const mapping = iconsByTitle?.[item.title];
                            if (mapping) {
                              const { name, platform } = mapping;
                              if (platform === "heroicons") {
                                const Outline =
                                  HeroOutline as unknown as Record<
                                    string,
                                    HeroIcon
                                  >;
                                const DynamicIcon: SidebarIcon =
                                  Outline[name] ?? item.icon;
                                  return <DynamicIcon className="size-4" />;
                              } else {
                                const LucideIcons = Lucide as unknown as Record<
                                  string,
                                  import("lucide-react").LucideIcon
                                >;
                                const DynamicIcon: SidebarIcon =
                                  LucideIcons[name] ?? item.icon;
                                  return <DynamicIcon className="size-4" />;
                              }
                            }
                            const Fallback = item.icon;
                            return <Fallback className="size-4" />;
                          })()}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                    {/* Actions always visible; chevron/collapsible only when children exist */}

                    {/** Always show settings and drag handle; only chevron appears if there are children */}
                    {enableEditing && (
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
                        hasChildren={Boolean(
                          item.items && item.items.length > 0,
                        )}
                        actionClassName="right-14"
                        // New: edit icon for existing parent
                        currentIcon={iconsByTitle?.[item.title]}
                        onUpdateIcon={(title, iconName, iconPlatform) =>
                          onUpdateParentIcon(title, iconName, iconPlatform)
                        }
                        // New: URL editing for parent
                        currentUrl={item.url}
                        onUpdateUrl={(title, url) =>
                          onUpdateParentUrl(title, url)
                        }
                      />
                    )}
                    {enableEditing && <ParentDragHandle className="right-7" />}
                    {visibleChildren.length > 0 ? (
                      <React.Fragment>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="transition-transform duration-300 ease-out data-[state=open]:rotate-90">
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
                              items={visibleChildren.map((i) => i.title)}
                              strategy={verticalListSortingStrategy}
                            >
                              <SidebarMenuSub>
                                {visibleChildren.map((subItem, index) => {
                                  return (
                                    <SortableChild
                                      key={subItem.title + index}
                                      id={subItem.title}
                                    >
                                      <SidebarMenuSubButton asChild>
                                        <Link
                                          href={subItem.url}
                                          onPointerDownCapture={(e) =>
                                            e.stopPropagation()
                                          }
                                        >
                                          <span>{subItem.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                      {enableEditing && (
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
                                          isRemovingChild={Boolean(
                                            isRemovingChild,
                                          )}
                                          actionClassName="right-7"
                                          // New: URL editing for child
                                          currentUrl={subItem.url}
                                          onUpdateUrl={(childTitle, url) =>
                                            onUpdateChildUrl(
                                              item.title,
                                              childTitle,
                                              url,
                                            )
                                          }
                                        />
                                      )}
                                      {enableEditing && (
                                        <ChildDragHandle className="right-7" />
                                      )}
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
