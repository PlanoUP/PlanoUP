"use client";

import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";
import Image from "next/image";
import { useBravaData } from "@/lib/brava/context";
import { AssetMapId, MapQuickFilter } from "@/lib/brava/maps/types";
import { getAssetMap, getMapByTank, getTankCoordinates, getTanksByMap, getMapSummary, matchesMapFilter, findTankAcrossMaps } from "@/lib/brava/maps/selectors";
import { sortByInspectionPriority } from "@/lib/brava/inspection";
import MapAreaSelector from "./MapAreaSelector";
import MapFilterBar from "./MapFilterBar";
import MapLegend from "./MapLegend";
import MapSummaryCard from "./MapSummaryCard";
import MapZoomPan, { MapZoomPanHandle } from "./MapZoomPan";
import MapHotspot from "./MapHotspot";
import MapAssetDrawer from "./MapAssetDrawer";
import MapAssetListPanel from "./MapAssetListPanel";
import MapCalibrationPanel from "./MapCalibrationPanel";

const IS_DEV = process.env.NODE_ENV === "development";

export default function AssetMapExplorer({ initialTag }: { initialTag?: string }) {
  const { tanks, today } = useBravaData();
  const [activeMapId, setActiveMapId] = useState<AssetMapId>(() => {
    if (initialTag) return getMapByTank(initialTag)?.id ?? "410-6313";
    return "410-6313";
  });
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<MapQuickFilter>("TODOS");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [highlightedTag, setHighlightedTag] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [calibrationActive, setCalibrationActive] = useState(false);
  const [calibrationPoint, setCalibrationPoint] = useState<{ x: number; y: number } | null>(null);

  const zoomPanRef = useRef<MapZoomPanHandle>(null);
  const lastAutoJumpRef = useRef<string | null>(null);
  const didInitialFocusRef = useRef(false);

  const map = getAssetMap(activeMapId);
  const entries = getTanksByMap(activeMapId, tanks);
  const summary = getMapSummary(activeMapId, tanks);
  const selectedTank = selectedTag ? entries.find((e) => e.tag === selectedTag)?.tank ?? null : null;

  const visibleEntries = entries.filter((e) => e.coordinate && (e.tank ? matchesMapFilter(e.tank, quickFilter, map.filters) : quickFilter === "TODOS"));

  function jumpTo(tag: string) {
    const targetMap = getMapByTank(tag);
    if (!targetMap) return;
    if (targetMap.id !== activeMapId) setActiveMapId(targetMap.id);
    setSelectedTag(tag);
    setHighlightedTag(tag);
    const coord = getTankCoordinates(targetMap.id, tag);
    if (coord) {
      // wait a tick for the map switch to render before focusing
      requestAnimationFrame(() => zoomPanRef.current?.focusOn(coord.x, coord.y));
    }
  }

  // Deep link from /brava/mapa?tank=TAG
  useEffect(() => {
    if (!initialTag || didInitialFocusRef.current) return;
    didInitialFocusRef.current = true;
    // Runs after MapZoomPan has mounted and laid out (child effects fire
    // before this one); jumpTo itself defers the actual focusOn a frame via
    // requestAnimationFrame. A setTimeout here would be cancelled by React's
    // dev-mode Strict Mode double-invoke cleanup before it ever fires.
    jumpTo(initialTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTag]);

  // Smart search: auto-locate on a unique match
  useEffect(() => {
    if (search.trim().length < 3) {
      lastAutoJumpRef.current = null;
      return;
    }
    const match = findTankAcrossMaps(search, tanks);
    if (match && match.tank.tag !== lastAutoJumpRef.current) {
      lastAutoJumpRef.current = match.tank.tag;
      jumpTo(match.tank.tag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tanks]);

  function handleAreaChange(id: AssetMapId) {
    setActiveMapId(id);
    setSearch("");
    setQuickFilter("TODOS");
    setHighlightedTag(null);
    zoomPanRef.current?.reset();
  }

  const datedTanks = entries.map((e) => e.tank).filter((t): t is NonNullable<typeof t> => t !== null);
  const sortedListEntries = sortByInspectionPriority(datedTanks).map((t) => ({
    tag: t.tag,
    tank: t,
    hasCoordinate: !!getTankCoordinates(activeMapId, t.tag),
  }));
  const undatedListEntries = entries
    .filter((e) => e.tank === null)
    .map((e) => ({ tag: e.tag, tank: null, hasCoordinate: !!e.coordinate }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MapAreaSelector activeMapId={activeMapId} onChange={handleAreaChange} />
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 self-start rounded-brava-sm border border-brava-border bg-brava-white px-3 py-1.5 text-[12px] font-semibold text-brava-text-secondary transition-colors hover:border-brava-blue/30 hover:text-brava-text sm:self-auto"
        >
          <List className="h-3.5 w-3.5" />
          Lista de Ativos
        </button>
      </div>

      <MapSummaryCard map={map} summary={summary} />

      <MapFilterBar search={search} onSearchChange={setSearch} filter={quickFilter} onFilterChange={setQuickFilter} extraFilters={map.filters} />

      <div className="relative">
        <MapZoomPan
          key={activeMapId}
          ref={zoomPanRef}
          aspectRatio={map.imageWidth / map.imageHeight}
          onCalibrationClick={calibrationActive ? (x, y) => setCalibrationPoint({ x, y }) : undefined}
        >
          <Image src={map.image} alt={map.name} fill sizes="100vw" className="pointer-events-none select-none object-cover" priority />
          {visibleEntries.map((e) => (
            <MapHotspot
              key={e.tag}
              tag={e.tag}
              x={e.coordinate!.x}
              y={e.coordinate!.y}
              tank={e.tank}
              highlighted={highlightedTag === e.tag}
              onSelect={() => {
                setSelectedTag(e.tag);
                setHighlightedTag(e.tag);
              }}
            />
          ))}
        </MapZoomPan>

        <MapLegend />

        {listOpen && (
          <MapAssetListPanel
            entries={[...sortedListEntries, ...undatedListEntries]}
            onSelect={(tag) => {
              jumpTo(tag);
              setListOpen(false);
            }}
            onClose={() => setListOpen(false)}
          />
        )}

        {IS_DEV && (
          <MapCalibrationPanel
            active={calibrationActive}
            onToggle={() => {
              setCalibrationActive((v) => !v);
              setCalibrationPoint(null);
            }}
            point={calibrationPoint}
            tankIds={map.tankIds}
          />
        )}
      </div>

      {selectedTag && (
        <MapAssetDrawer
          tag={selectedTag}
          tank={selectedTank}
          today={today}
          onClose={() => {
            setSelectedTag(null);
            setHighlightedTag(null);
          }}
        />
      )}
    </div>
  );
}
