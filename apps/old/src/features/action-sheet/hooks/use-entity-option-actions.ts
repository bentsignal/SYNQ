import { useCallback, useEffect, useState } from "react";
import { PageType, type SongType } from "@/src/constants/Types";
import {
  confirmEntityDelete,
  exportEntitySongs,
  navigateToEntityEdit,
} from "@/src/features/action-sheet/lib/entity-option-actions";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { posthog } from "@/src/lib/posthog";
import type { Href } from "expo-router";

type EntityOptionEntity = {
  id: number;
  name?: string;
  pageType?: PageType;
};

type EntityOptionActionsInput<Entity extends EntityOptionEntity> = {
  deleteEntity: (id: number) => Promise<void>;
  deleteEventName: string;
  deleteFallbackName: string;
  deleteMessage: (name: string) => string;
  deleteTitle: string;
  detailPageType: PageType;
  editEventName: string;
  entity: Entity;
  getEditPath: (id: number) => Href;
  loadSongs: (entity: Entity) => Promise<SongType[]>;
  sheetName: string;
  exportEventName: string;
};

export function useEntityOptionActions<Entity extends EntityOptionEntity>({
  deleteEntity,
  deleteEventName,
  deleteFallbackName,
  deleteMessage,
  deleteTitle,
  detailPageType,
  editEventName,
  entity,
  exportEventName,
  getEditPath,
  loadSongs,
  sheetName,
}: EntityOptionActionsInput<Entity>) {
  const { setShowGlobalLoading } = useGlobalProgressContext();
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (entity.pageType) {
      setPageType(entity.pageType);
    }
  }, [entity]);

  const handleEdit = useCallback(() => {
    navigateToEntityEdit({
      sheetName,
      eventName: editEventName,
      path: getEditPath(entity.id),
    });
  }, [editEventName, entity.id, getEditPath, sheetName]);

  const handleExport = useCallback(async () => {
    await exportEntitySongs({
      sheetName,
      eventName: exportEventName,
      setShowGlobalLoading,
      loadSongs: () => loadSongs(entity),
    });
  }, [entity, exportEventName, loadSongs, setShowGlobalLoading, sheetName]);

  const executeDelete = useCallback(async () => {
    try {
      posthog.capture(deleteEventName);
      await deleteEntity(entity.id);
    } catch {
      return;
    }
  }, [deleteEntity, deleteEventName, entity.id]);

  const handleDelete = useCallback(() => {
    confirmEntityDelete({
      sheetName,
      title: deleteTitle,
      message: deleteMessage(entity.name ?? deleteFallbackName),
      isDetailPage: pageType === detailPageType,
      executeDelete,
    });
  }, [
    deleteFallbackName,
    deleteMessage,
    deleteTitle,
    detailPageType,
    entity.name,
    executeDelete,
    pageType,
    sheetName,
  ]);

  return {
    handleDelete,
    handleEdit,
    handleExport,
    pageType,
  };
}
