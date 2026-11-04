"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { List, Play, Pause, MonitorPlay } from "lucide-react";
import Image from "next/image";
import { useBravaData } from "@/lib/brava/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { useMapCoordinatesData, useMapCalloutOffsetsData } from "@/lib/brava/maps/context";
import { AssetMapId, MapQuickFilter } from "@/lib/brava/maps/types";
import { getAssetMap, getMapByTank, getTankCoordinates, getTanksByMap, getMapSummary, matchesMapFilter, findTankAcrossMaps } from "@/lib/brava/maps/selectors";
import { computeCalloutLayout } from "@/lib/brava/maps/calloutLayout";
import { TankStatus } from "@/lib/brava/types";
import { sortByInspectionPriority } from "@/lib/brava/inspection";
import { cn } from "@/lib/brava/cn";
import MapAreaSelector from "./MapAreaSelector";
import MapFilterBar from "./MapFilterBar";
import MapLegend from "./MapLegend";
import MapSummaryCard from "./MapSummaryCard";
import MapZoomPan, { MapZoomPanHandle } from "./MapZoomPan";
import MapHotspot from "./MapHotspot";
import MapAssetDrawer from "./MapAssetDrawer";
import MapAssetListPanel from "./MapAssetListPanel";
import MapCalibrationPanel from "./MapCalibrationPanel";
import MapTourPanel from "./MapTourPanel";
import MapPresentationMode from "./MapPresentationMode";
import MapHoverToolbar from "./MapHoverToolbar";

const IS_DEV = process.env.NODE_ENV === "development";
// Every status with a real, dated maintenance plan to show on the map — a
// callout (tag + progress bar), a ticker line, a carousel slot. PROGRAMADO
// is included: it has confirmed dates and 0% progress is itself meaningful
// information ("next up"), unlike SEM_PROJETO, which has no plan at all to
// show anything about.
const MAINTENANCE_STATUSES: TankStatus[] = ["PROGRAMADO", "EM_EXECUCAO", "ATRASADO", "CRITICO"];

export default function AssetMapExplorer({
  initialTag,
  autoStartTour,
  embedded,
}: {
  initialTag?: string;
  /** Starts the auto-tour itself once there's something to cycle through — for an unattended context (Modo Apresentação) that can't click the button. */
  autoStartTour?: boolean;
  /** True when mounted inside the map's own Modo Apresentação overlay — hides the "Modo Apresentação" entry point so it can't nest inside itself. */
  embedded?: boolean;
}) {
  const { tanks, today } = useBravaData();
  const { isEditor } = useEditAuth();
  const { coordinates: overrides, saveCoordinate, deleteCoordinate } = useMapCoordinatesData();
  const { offsets: calloutOffsetOverrides, saveOffset: saveCalloutOffset, deleteOffset: deleteCalloutOffset } = useMapCalloutOffsetsData();
  const [activeMapId, setActiveMapId] = useState<AssetMapId>(() => {
    if (initialTag) return getMapByTank(initialTag, overrides)?.id ?? "geral";
    return "geral";
  });
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<MapQuickFilter>("TODOS");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [highlightedTag, setHighlightedTag] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [calibrationActive, setCalibrationActive] = useState(false);
  const [calibrationPoint, setCalibrationPoint] = useState<{ x: number; y: number } | null>(null);
  // The map's actual rendered CSS pixel size (reported by MapZoomPan), used
  // for the callout layout instead of the image's native file dimensions —
  // see the comment on calloutLayout below for why that distinction matters.
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(null);
  // Current zoom factor from MapZoomPan — needed to convert a callout drag's
  // raw pointer-movement px into the (unscaled) layer space the offset
  // itself is expressed in; see MapHotspot's onBoxPointerMove.
  const [mapScale, setMapScale] = useState(1);
  // Auto-tour: cycles the map's zoom through each in-maintenance tank, in
  // lockstep with MapTourPanel's media (video, then photo, then a plain
  // status card) — one index, shared, so the zoom and the panel can never
  // drift out of sync with each other.
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [presentationActive, setPresentationActive] = useState(false);

  const zoomPanRef = useRef<MapZoomPanHandle>(null);
  const lastAutoJumpRef = useRef<string | null>(null);
  const didInitialFocusRef = useRef(false);

  const map = getAssetMap(activeMapId);
  // Concluded tanks stay off the map entirely (dot included, not just the
  // callout/progress card) — they're still accompanied on their own
  // dashboard page for historical record, just not as an active-tracking
  // element here.
  const entries = getTanksByMap(activeMapId, tanks, overrides).filter((e) => e.tank?.status !== "CONCLUIDO");
  const summary = getMapSummary(activeMapId, tanks);
  const selectedTank = selectedTag ? entries.find((e) => e.tag === selectedTag)?.tank ?? null : null;

  const visibleEntries = entries.filter((e) => e.coordinate && (e.tank ? matchesMapFilter(e.tank, quickFilter, map.filters) : quickFilter === "TODOS"));

  // computeCalloutLayout's box-separation math (BOX_WIDTH/HEIGHT/MARGIN) is
  // expressed in real CSS pixels, since that's what the callout box is
  // finally rendered at — so the dot positions it starts from need to be in
  // that same unit. The image's native file dimensions (map.imageWidth/
  // imageHeight) only match the actual rendered CSS size by coincidence;
  // fullscreen in particular almost always renders larger than native
  // resolution. Falls back to the native dimensions only until the first
  // real measurement comes in from MapZoomPan.
  const layoutWidth = viewportSize?.width ?? map.imageWidth;
  const layoutHeight = viewportSize?.height ?? map.imageHeight;

  const calloutLayout = useMemo(() => {
    const points = visibleEntries
      .filter((e) => e.tank && MAINTENANCE_STATUSES.includes(e.tank.status) && e.coordinate)
      .map((e) => ({ tag: e.tag, xPct: e.coordinate!.x, yPct: e.coordinate!.y }));
    // Every dot currently on screen is an obstacle a callout box must steer
    // clear of — not just the ones that get a callout of their own —
    // otherwise a box can end up sitting on top of a NEIGHBORING tank's icon.
    const obstacles = visibleEntries
      .filter((e) => e.coordinate)
      .map((e) => ({ tag: e.tag, xPct: e.coordinate!.x, yPct: e.coordinate!.y }));
    const layout = computeCalloutLayout(points, layoutWidth, layoutHeight, obstacles);
    // A manually dragged position (saved via MapHotspot's drag handling)
    // wins over the auto-computed one for that tag — the auto layout still
    // decides every OTHER box, which don't know to avoid a dragged box in
    // return, same tradeoff the obstacle pass already accepts for ordinary
    // tank icons that have no callout of their own.
    for (const o of calloutOffsetOverrides) {
      if (o.mapId === activeMapId && o.tag in layout) layout[o.tag] = { dx: o.dx, dy: o.dy };
    }
    return layout;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleEntries, layoutWidth, layoutHeight, calloutOffsetOverrides, activeMapId]);

  // Independent of the quick-filter chips/search — the auto-tour always
  // cycles every tank in maintenance on this area, not just whatever's
  // currently filtered into view.
  const maintenanceEntries = entries.filter((e) => e.tank && MAINTENANCE_STATUSES.includes(e.tank.status) && e.coordinate);
  const tourTags = maintenanceEntries.map((e) => e.tag).sort();
  const tanksByTag = useMemo(() => new Map(tanks.map((t) => [t.tag, t])), [tanks]);

  // Fullscreen control-bar KPIs — also independent of the quick-filter
  // chips, same reasoning as the video carousel above. No "concluído" count
  // here: concluded tanks are filtered out of `entries` above, so it would
  // always read 0 — misleading rather than informative.
  const fullscreenSummary = {
    programado: maintenanceEntries.filter((e) => e.tank!.status === "PROGRAMADO").length,
    emExecucao: maintenanceEntries.filter((e) => e.tank!.status === "EM_EXECUCAO").length,
    atrasado: maintenanceEntries.filter((e) => e.tank!.status === "ATRASADO").length,
    critico: maintenanceEntries.filter((e) => e.tank!.status === "CRITICO").length,
  };

  function jumpTo(tag: string) {
    setTourActive(false);
    const targetMap = getMapByTank(tag, overrides);
    if (!targetMap) return;
    if (targetMap.id !== activeMapId) setActiveMapId(targetMap.id);
    setSelectedTag(tag);
    setHighlightedTag(tag);
    const coord = getTankCoordinates(targetMap.id, tag, overrides);
    if (coord) {
      // wait a tick for the map switch to render before focusing
      requestAnimationFrame(() => zoomPanRef.current?.focusOn(coord.x, coord.y));
    }
  }

  function startTour() {
    if (tourTags.length === 0) return;
    setSelectedTag(null);
    setTourIndex(0);
    setTourActive(true);
  }

  function stopTour() {
    setTourActive(false);
    setHighlightedTag(null);
    zoomPanRef.current?.reset();
  }

  const didAutoStartRef = useRef(false);
  useEffect(() => {
    if (!autoStartTour || didAutoStartRef.current || tourTags.length === 0) return;
    didAutoStartRef.current = true;
    startTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartTour, tourTags.length]);

  // Keeps the zoom locked onto whichever tank the tour is currently sitting
  // on — MapTourPanel only advances tourIndex, this is what actually moves
  // the map, so the two can never fall out of sync with each other.
  useEffect(() => {
    if (!tourActive) return;
    const tag = tourTags[tourIndex];
    if (!tag) return;
    setHighlightedTag(tag);
    const coord = getTankCoordinates(activeMapId, tag, overrides);
    if (coord) zoomPanRef.current?.focusOn(coord.x, coord.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourActive, tourIndex, activeMapId]);

  // The tour's tank list can shrink mid-cycle (a tank wraps up, a filter...
  // no, filters don't affect it — but the underlying maintenance set can
  // still change as statuses update) — keep the index valid.
  useEffect(() => {
    if (tourIndex >= tourTags.length) setTourIndex(0);
  }, [tourTags.length, tourIndex]);

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
    const match = findTankAcrossMaps(search, tanks, overrides);
    if (match && match.tank.tag !== lastAutoJumpRef.current) {
      lastAutoJumpRef.current = match.tank.tag;
      jumpTo(match.tank.tag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tanks, overrides]);

  function handleAreaChange(id: AssetMapId) {
    setTourActive(false);
    setActiveMapId(id);
    setSearch("");
    setQuickFilter("TODOS");
    setHighlightedTag(null);
    setViewportSize(null);
    zoomPanRef.current?.reset();
  }

  const datedTanks = entries.map((e) => e.tank).filter((t): t is NonNullable<typeof t> => t !== null);
  const sortedListEntries = sortByInspectionPriority(datedTanks).map((t) => ({
    tag: t.tag,
    tank: t,
    hasCoordinate: !!getTankCoordinates(activeMapId, t.tag, overrides),
  }));
  const undatedListEntries = entries
    .filter((e) => e.tank === null)
    .map((e) => ({ tag: e.tag, tank: null, hasCoordinate: !!e.coordinate }));

  const chrome = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MapAreaSelector activeMapId={activeMapId} onChange={handleAreaChange} />
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => (tourActive ? stopTour() : startTour())}
            disabled={tourTags.length === 0}
            title={tourTags.length === 0 ? "Nenhum ativo em manutenção neste mapa" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-brava-sm border px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              embedded
                ? tourActive
                  ? "border-brava-blue bg-brava-blue text-brava-white"
                  : "border-brava-border bg-brava-white text-brava-text-secondary hover:border-brava-blue/30 hover:text-brava-text"
                : tourActive
                  ? "border-white bg-white text-brava-blue-dark"
                  : "border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
            )}
          >
            {tourActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {tourActive ? "Pausar Tour" : "Tour Automático"}
          </button>
          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-brava-sm border px-3 py-1.5 text-[12px] font-semibold transition-colors",
              embedded
                ? "border-brava-border bg-brava-white text-brava-text-secondary hover:border-brava-blue/30 hover:text-brava-text"
                : "border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
            )}
          >
            <List className="h-3.5 w-3.5" />
            Lista de Ativos
          </button>
          {!embedded && (
            <button
              type="button"
              onClick={() => setPresentationActive(true)}
              className="inline-flex items-center gap-1.5 rounded-brava-sm border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/20"
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              Modo Apresentação
            </button>
          )}
        </div>
      </div>

      <MapSummaryCard map={map} summary={summary} />

      <MapFilterBar search={search} onSearchChange={setSearch} filter={quickFilter} onFilterChange={setQuickFilter} extraFilters={map.filters} />
    </>
  );

  const mapCanvas = (
    <div className={cn("relative", !embedded && "h-full w-full")}>
      <MapZoomPan
        key={activeMapId}
        ref={zoomPanRef}
        aspectRatio={map.imageWidth / map.imageHeight}
        forceChrome={!embedded}
        onCalibrationClick={calibrationActive ? (x, y) => setCalibrationPoint({ x, y }) : undefined}
        backgroundSrc={map.image}
        fullscreenLabel="Paradas de Manutenção - Tanques"
        fullscreenSummary={fullscreenSummary}
        onViewportSizeChange={setViewportSize}
        onScaleChange={setMapScale}
        tourSlot={
          tourActive && tourTags.length > 0 ? (
            <MapTourPanel
              tags={tourTags}
              activeIndex={tourIndex}
              tanksByTag={tanksByTag}
              onAdvance={() => setTourIndex((i) => (i + 1) % tourTags.length)}
              onPrev={() => setTourIndex((i) => (i - 1 + tourTags.length) % tourTags.length)}
              onNext={() => setTourIndex((i) => (i + 1) % tourTags.length)}
              onStop={stopTour}
            />
          ) : undefined
        }
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
            calloutOffset={calloutLayout[e.tag]}
            onSelect={() => {
              setTourActive(false);
              setSelectedTag(e.tag);
              setHighlightedTag(e.tag);
            }}
            draggable={IS_DEV || isEditor}
            mapScale={mapScale}
            onCalloutOffsetChange={(dx, dy) => saveCalloutOffset({ mapId: activeMapId, tag: e.tag, dx, dy })}
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

      {(IS_DEV || isEditor) && (
        <MapCalibrationPanel
          active={calibrationActive}
          onToggle={() => {
            setCalibrationActive((v) => !v);
            setCalibrationPoint(null);
          }}
          point={calibrationPoint}
          tankIds={map.tankIds}
          savedCoordinates={overrides.filter((o) => o.mapId === activeMapId)}
          onSave={(tag, point) => {
            saveCoordinate({ mapId: activeMapId, tag, x: point.x, y: point.y });
            setCalibrationPoint(null);
          }}
          onRemove={(id) => deleteCoordinate(id)}
          draggedCallouts={calloutOffsetOverrides.filter((o) => o.mapId === activeMapId)}
          onResetCallout={(id) => deleteCalloutOffset(id)}
        />
      )}
    </div>
  );

  return (
    <>
      {embedded ? (
        <div className="space-y-4">
          {chrome}
          {mapCanvas}
        </div>
      ) : (
        <div className="fixed inset-0 z-[60] bg-black">
          {mapCanvas}
          <MapHoverToolbar exitHref="/brava">{chrome}</MapHoverToolbar>
        </div>
      )}

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

      {!embedded && presentationActive && (
        <MapPresentationMode onExit={() => setPresentationActive(false)} />
      )}
    </>
  );
}
