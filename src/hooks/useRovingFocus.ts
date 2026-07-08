import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type Orientation = "horizontal" | "vertical" | "both";

interface UseRovingFocusOptions {
  ids: string[];
  selectedId?: string | null;
  orientation?: Orientation;
  loop?: boolean;
  activateOnFocus?: boolean;
  onActivate?: (id: string) => void;
}

const isPreviousKey = (key: string, orientation: Orientation) =>
  key === "Home" ||
  (orientation !== "horizontal" && key === "ArrowUp") ||
  (orientation !== "vertical" && key === "ArrowLeft");

const isNextKey = (key: string, orientation: Orientation) =>
  key === "End" ||
  (orientation !== "horizontal" && key === "ArrowDown") ||
  (orientation !== "vertical" && key === "ArrowRight");

export function useRovingFocus({
  ids,
  selectedId,
  orientation = "vertical",
  loop = true,
  activateOnFocus = false,
  onActivate,
}: UseRovingFocusOptions) {
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const fallbackId = selectedId && ids.includes(selectedId) ? selectedId : ids[0];
  const [activeId, setActiveId] = useState<string | undefined>(fallbackId);

  useEffect(() => {
    if (!fallbackId) {
      setActiveId(undefined);
      return;
    }
    setActiveId((current) => (current && ids.includes(current) ? current : fallbackId));
  }, [fallbackId, ids]);

  const focusItem = useCallback(
    (id: string, shouldActivate = activateOnFocus) => {
      setActiveId(id);
      itemRefs.current.get(id)?.focus();
      if (shouldActivate) {
        onActivate?.(id);
      }
    },
    [activateOnFocus, onActivate],
  );

  const move = useCallback(
    (fromId: string, direction: -1 | 1) => {
      const currentIndex = ids.indexOf(fromId);
      if (currentIndex === -1) {
        return;
      }

      let nextIndex = currentIndex + direction;
      if (nextIndex < 0) {
        nextIndex = loop ? ids.length - 1 : 0;
      }
      if (nextIndex >= ids.length) {
        nextIndex = loop ? 0 : ids.length - 1;
      }

      const nextId = ids[nextIndex];
      if (nextId) {
        focusItem(nextId);
      }
    },
    [focusItem, ids, loop],
  );

  const getItemProps = useMemo(
    () => (id: string) => ({
      ref: (node: HTMLElement | null) => {
        if (node) {
          itemRefs.current.set(id, node);
        } else {
          itemRefs.current.delete(id);
        }
      },
      tabIndex: id === activeId ? 0 : -1,
      onFocus: () => setActiveId(id),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (ids.length === 0) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate?.(id);
          return;
        }

        if (isPreviousKey(event.key, orientation)) {
          event.preventDefault();
          if (event.key === "Home") {
            focusItem(ids[0] ?? id);
          } else {
            move(id, -1);
          }
          return;
        }

        if (isNextKey(event.key, orientation)) {
          event.preventDefault();
          if (event.key === "End") {
            focusItem(ids[ids.length - 1] ?? id);
          } else {
            move(id, 1);
          }
        }
      },
    }),
    [activeId, focusItem, ids, move, onActivate, orientation],
  );

  return { activeId, focusItem, getItemProps };
}
