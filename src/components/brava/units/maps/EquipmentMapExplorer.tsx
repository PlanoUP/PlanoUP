"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { List } from "lucide-react";
import Image from "next/image";
import { useUnitsData } from "@/lib/brava/units/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { useEquipmentMapCoordinatesData } from "@/lib/brava/units/maps/context";
import { EquipmentMapId, EquipmentMapQuickFilter } from "@/lib/brava/units/maps/types";
import {
  getEquipmentAssetMap,
  getMapByEquipment,
  getEquipmentCoordinates,
  getEquipmentByMap,
  getEquipmentMapSummary,
  matchesEquipmentMapFilter,
  findEquipmentAcrossMaps,
} from "@/lib/brava/units/maps/selectors";
import { computeCalloutLayout } from "@/lib/brava/maps/calloutLayout";
import { EquipmentStatus } from "@/lib/brava/units/types";
import { STATUS_ORDER } from "@/lib/brava/status-meta";
import EquipmentMapAreaSelector from "./EquipmentMapAreaSelector";
import EquipmentMapFilterBar from "./EquipmentMapFilterBar";
import EquipmentMapLegend from "./EquipmentMapLegend";
import EquipmentMapSummaryCard from "./EquipmentMapSummaryCard";
import MapZoomPan, { MapZoomPanHandle } from "../../maps/MapZoomPan";
import EquipmentMapHotspot from "./EquipmentMapHotspot";
import EquipmentMapAssetDrawer from "./EquipmentMapAssetDrawer";
import EquipmentMapAssetListPanel from "./EquipmentMapAssetListPanel";
import EquipmentMapCalibrationPanel from "./EquipmentMapCalibrationPanel";

const IS_DEV = process.env.NODE_ENV === "development";
const MAINTENANCE_STATUSES: EquipmentStatus[] = ["EM_EXECUCAO", "ATRASADO", "CRITICO", "CONCLUIDO"];

export default function EquipmentMapExplorer({ initialTag }: { initialTag?: string }) {
  const { equipment, today } = useUnitsData();
  const { isEditor } = useEditAuth();
  const { coordinates: overrides, saveCoordinate, deleteCoordinate } = useEquipmentMapCoordinatesData();
  const [activeMapId, setActiveMapId] = useState<EquipmentMapId>(() => {
    if (initialTag) return getMapByEquipment(initialTag, overrides)?.id ?? "geral";
    return "geral";
  });
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<EquipmentMapQuickFilter>("TODOS");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [highlightedTag, setHighlightedTag] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [calibrationActive, setCalibrationActive] = useState(false);
  const [calibrationPoint, setCalibrationPoint] = useState<{ x: number; y: number } | null>(null);

  const zoomPanRef = useRef<MapZoomPanHandle>(null);
  const lastAutoJumpRef = useRef<string | null>(null);
  const didInitialFocusRef = useRef(false);

  const map = getEquipmentAssetMap(activeMapId);
  const entries = getEquipmentByMap(activeMapId, equipment, overrides);
  const summary = getEquipmentMapSummary(activeMapId, equipment);
  const selectedEquipment = selectedTag ? entries.find((e) => e.tag === selectedTag)?.equipment ?? null : null;

  const visibleEntries = entries.filter(
    (e) => e.coordinate && (e.equipment ? matchesEquipmentMapFilter(e.equipment, quickFilter, map.filters) : quickFilter === "TODOS")
  );

  const calloutLayout = useMemo(() => {
    const points = visibleEntries
      .filter((e) => e.equipment && MAINTENANCE_STATUSES.includes(e.equipment.status) && e.coordinate)
      .map((e) => ({ tag: e.tag, xPct: e.coordinate!.x, yPct: e.coordinate!.y }));
    return computeCalloutLayout(points, map.imageWidth, map.imageHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleEntries, map.imageWidth, map.imageHeight]);

  function jumpTo(tag: string) {
    const targetMap = getMapByEquipment(tag, overrides);
    if (!targetMap) return;
    if (targetMap.id !== activeMapId) setActiveMapId(targetMap.id);
    setSelectedTag(tag);
    setHighlightedTag(tag);
    const coord = getEquipmentCoordinates(targetMap.id, tag, overrides);
    if (coord) {
      requestAnimationFrame(() => zoomPanRef.current?.focusOn(coord.x, coord.y));
    }
  }

  // Deep link from /brava/unidades/mapa?tag=TAG
  useEffect(() => {
    if (!initialTag || didInitialFocusRef.current) return;
    didInitialFocusRef.current = true;
    jumpTo(initialTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTag]);

  // Smart search: auto-locate on a unique match
  useEffect(() => {
    if (search.trim().length < 3) {
      lastAutoJumpRef.current = null;
      return;
    }
    const match = findEquipmentAcrossMaps(search, equipment, overrides);
    if (match && match.equipment.tag !== lastAutoJumpRef.current) {
      lastAutoJumpRef.current = match.equipment.tag;
      jumpTo(match.equipment.tag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, equipment, overrides]);

  function handleAreaChange(id: EquipmentMapId) {
    setActiveMapId(id);
    setSearch("");
    setQuickFilter("TODOS");
    setHighlightedTag(null);
    zoomPanRef.current?.reset();
  }

  const datedEquipment = entries.map((e) => e.equipment).filter((e): e is NonNullable<typeof e> => e !== null);
  const sortedListEntries = [...datedEquipment]
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.tag.localeCompare(b.tag))
    .map((e) => ({
      tag: e.tag,
      equipment: e,
      hasCoordinate: !!getEquipmentCoordinates(activeMapId, e.tag, overrides),
    }));
  const undatedListEntries = entries
    .filter((e) => e.equipment === null)
    .map((e) => ({ tag: e.tag, equipment: null, hasCoordinate: !!e.coordinate }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <EquipmentMapAreaSelector activeMapId={activeMapId} onChange={handleAreaChange} />
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 self-start rounded-brava-sm border border-brava-border bg-brava-white px-3 py-1.5 text-[12px] font-semibold text-brava-text-secondary transition-colors hover:border-brava-blue/30 hover:text-brava-text sm:self-auto"
        >
          <List className="h-3.5 w-3.5" />
          Lista de Ativos
        </button>
      </div>

      <EquipmentMapSummaryCard map={map} summary={summary} />

      <EquipmentMapFilterBar search={search} onSearchChange={setSearch} filter={quickFilter} onFilterChange={setQuickFilter} extraFilters={map.filters} />

      <div className="relative">
        <MapZoomPan
          key={activeMapId}
          ref={zoomPanRef}
          aspectRatio={map.imageWidth / map.imageHeight}
          onCalibrationClick={calibrationActive ? (x, y) => setCalibrationPoint({ x, y }) : undefined}
          backgroundSrc={map.image}
        >
          <Image src={map.image} alt={map.name} fill sizes="100vw" className="pointer-events-none select-none object-cover" priority />
          {visibleEntries.map((e) => (
            <EquipmentMapHotspot
              key={e.tag}
              tag={e.tag}
              x={e.coordinate!.x}
              y={e.coordinate!.y}
              equipment={e.equipment}
              highlighted={highlightedTag === e.tag}
              calloutOffset={calloutLayout[e.tag]}
              onSelect={() => {
                setSelectedTag(e.tag);
                setHighlightedTag(e.tag);
              }}
            />
          ))}
        </MapZoomPan>

        <EquipmentMapLegend />

        {listOpen && (
          <EquipmentMapAssetListPanel
            entries={[...sortedListEntries, ...undatedListEntries]}
            onSelect={(tag) => {
              jumpTo(tag);
              setListOpen(false);
            }}
            onClose={() => setListOpen(false)}
          />
        )}

        {(IS_DEV || isEditor) && (
          <EquipmentMapCalibrationPanel
            active={calibrationActive}
            onToggle={() => {
              setCalibrationActive((v) => !v);
              setCalibrationPoint(null);
            }}
            point={calibrationPoint}
            equipmentIds={map.equipmentIds}
            savedCoordinates={overrides.filter((o) => o.mapId === activeMapId)}
            onSave={(tag, point) => {
              saveCoordinate({ mapId: activeMapId, tag, x: point.x, y: point.y });
              setCalibrationPoint(null);
            }}
            onRemove={(id) => deleteCoordinate(id)}
          />
        )}
      </div>

      {selectedTag && (
        <EquipmentMapAssetDrawer
          tag={selectedTag}
          equipment={selectedEquipment}
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
