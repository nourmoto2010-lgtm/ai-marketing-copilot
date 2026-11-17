"use client";

import React, { useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Kanban,
  Layers,
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import { Task, TaskStatus } from "@/types/database";
import {
  cn,
  CONTENT_TYPE_META,
  PRIORITY_META,
  ROLE_LABELS,
  TASK_STATUS_META,
} from "@/lib/utils";
import { SmartTaskDrawer } from "@/components/workspace/smart-task-drawer";
import { AiTaskSplitterModal } from "@/components/workspace/ai-task-splitter";

const KANBAN_COLUMNS: TaskStatus[] = [
  "backlog",
  "in_progress",
  "in_review",
  "revision_requested",
  "approved",
  "published",
];

export default function WorkspaceKanbanPage() {
  const {
    tasks,
    clients,
    users,
    currentUser,
    currentRole,
    selectedClientFilter,
    updateTaskStatus,
  } = useAppStore();

  const [onlyMyRoleTasks, setOnlyMyRoleTasks] = useState<boolean>(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(
    null
  );
  const [isSplitterOpen, setIsSplitterOpen] = useState<boolean>(false);

  // Filter tasks based on Client, RBAC toggle, and Role Filter
  const visibleTasks = tasks.filter((t) => {
    if (
      selectedClientFilter !== "all" &&
      t.client_id !== selectedClientFilter
    ) {
      return false;
    }
    if (onlyMyRoleTasks && t.assigned_to !== currentUser.id) {
      return false;
    }
    if (selectedRoleFilter !== "all" && t.role_slug !== selectedRoleFilter) {
      return false;
    }
    return true;
  });

  const activeTask =
    tasks.find((t) => t.id === activeDrawerTaskId) || null;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    updateTaskStatus(draggableId, destination.droppableId as TaskStatus);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              مساحة العمل الذكية ولوحة المهام (Smart Kanban & Role Copilot)
            </h1>
            <span className="text-xs font-en font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Drag & Drop Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500">
            اضغط على أي بطاقة مهمة لفتح **درج المهمة الذكي (Smart Task Drawer)** واستخدام **المساعد الذكي المخصص لدورك (Role Copilot)**، أو اسحب البطاقات لتغيير حالتها.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle: Only My Tasks */}
          <button
            type="button"
            onClick={() => setOnlyMyRoleTasks(!onlyMyRoleTasks)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5",
              onlyMyRoleTasks
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>مهامي الشخصية فقط ({currentUser.full_name.split(" ")[0]})</span>
          </button>

          {/* Role Filter Dropdown */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
          >
            <option value="all">كل التخصصات (6 أدوار)</option>
            <option value="content_creator">صانع المحتوى (Content Creator)</option>
            <option value="graphic_designer">مصمم الجرافيك (Graphic & AI)</option>
            <option value="video_editor">مونتير الفيديو (Video Editor)</option>
            <option value="media_buyer">الإعلانات الممولة (Media Buyer)</option>
            <option value="moderation">إدارة المجتمعات (Moderation)</option>
          </select>

          {/* AI Campaign Breakdown Button */}
          <button
            type="button"
            onClick={() => setIsSplitterOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow hover:opacity-95 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>تحويل حملة/فكرة إلى مهام بالـ AI</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-start">
          {KANBAN_COLUMNS.map((statusKey) => {
            const meta = TASK_STATUS_META[statusKey];
            const columnTasks = visibleTasks.filter(
              (t) => t.status === statusKey
            );

            return (
              <div
                key={statusKey}
                className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-h-[540px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("w-2.5 h-2.5 rounded-full", meta.dotColor)}
                    />
                    <h3 className="text-xs font-extrabold text-slate-800">
                      {meta.label_ar}
                    </h3>
                  </div>
                  <span className="text-xs font-en font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={statusKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 space-y-3 rounded-xl transition-colors p-1",
                        snapshot.isDraggingOver && "bg-indigo-50/70"
                      )}
                    >
                      {columnTasks.map((task, idx) => {
                        const client = clients.find(
                          (c) => c.id === task.client_id
                        );
                        const assignee = users.find(
                          (u) => u.id === task.assigned_to
                        );
                        const priorityMeta = PRIORITY_META[task.priority];

                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={idx}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => setActiveDrawerTaskId(task.id)}
                                className={cn(
                                  "bg-white rounded-xl p-3.5 border border-slate-200 shadow-card-soft hover:border-indigo-400 cursor-pointer transition space-y-2.5 group",
                                  dragSnapshot.isDragging &&
                                    "shadow-xl ring-2 ring-indigo-500 rotate-1"
                                )}
                              >
                                {/* Client + Priority */}
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[11px] font-bold text-slate-700 truncate flex items-center gap-1">
                                    <span>{client?.logo_url}</span>
                                    <span className="truncate">
                                      {client?.name}
                                    </span>
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0",
                                      priorityMeta.className
                                    )}
                                  >
                                    {priorityMeta.label_ar}
                                  </span>
                                </div>

                                {/* Task Title */}
                                <h4 className="text-xs font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                                  {task.title}
                                </h4>

                                {/* Role & Content Type */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-md border font-semibold",
                                      ROLE_LABELS[task.role_slug]?.badgeClass
                                    )}
                                  >
                                    {ROLE_LABELS[task.role_slug]?.ar}
                                  </span>
                                  <span className="text-[10px] font-en px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                    {
                                      CONTENT_TYPE_META[task.content_type]
                                        ?.label_en
                                    }
                                  </span>
                                </div>

                                {/* Revision Alert if any */}
                                {task.revision_count > 0 && (
                                  <div className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span>
                                      تعديلات مطلوبة ({task.revision_count})
                                    </span>
                                  </div>
                                )}

                                {/* Footer: Assignee + Ask AI Copilot Button */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {assignee && (
                                      <img
                                        src={assignee.avatar_url}
                                        alt={assignee.full_name}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    )}
                                    <span className="text-[11px] font-semibold text-slate-600 truncate">
                                      {assignee?.full_name.split(" ")[0]}
                                    </span>
                                  </div>

                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-ai-gradient group-hover:text-white transition">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Ask Copilot</span>
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Interactive Task Drawer with Role-Specific AI Copilot */}
      <SmartTaskDrawer
        task={activeTask}
        onClose={() => setActiveDrawerTaskId(null)}
      />

      {/* AI Campaign Breakdown Modal */}
      <AiTaskSplitterModal
        isOpen={isSplitterOpen}
        onClose={() => setIsSplitterOpen(false)}
      />
    </div>
  );
}
