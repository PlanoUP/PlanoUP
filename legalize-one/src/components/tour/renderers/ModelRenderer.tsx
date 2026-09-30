import { Box } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import type { TourRendererProps } from './types'

/**
 * MODO 2 — MODELO 3D (GLB/GLTF). Ponto de extensão, ainda sem engine.
 *
 * Este módulo é carregado sob demanda (React.lazy), então a futura dependência
 * de Three.js / React Three Fiber (+ drei `useGLTF`) ficará isolada neste chunk
 * e só será baixada por quem abrir um tour com `tourType: 'model'`.
 *
 * Contrato já disponível para a implementação:
 * - `tour.model`: `{ format, url, poster, unitsPerMeter }`;
 * - `scene.viewpoint`: `{ position, target }` da câmera para cada ambiente
 *   (trocar de cena = animar a câmera até o novo ponto de vista);
 * - `hotspot.point`: posição 3D dos hotspots (projetar na tela a cada frame e
 *   chamar `onHotspotSelect` / `renderHotspotCard` com a posição projetada);
 * - `onInteract` / `onBackgroundTap`: mesmos eventos do renderizador panorâmico.
 *
 * Até lá, exibe a prévia da cena para nunca mostrar uma tela vazia.
 */
export default function ModelRenderer({ tour, scene }: TourRendererProps) {
  return (
    <div className="absolute inset-0 bg-navy-950">
      <SmartImage
        src={tour.model?.poster ?? scene.image}
        alt={scene.label}
        fallback={scene.fallback}
        loading="eager"
        className="absolute inset-0 opacity-70"
      />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="max-w-xs rounded-2xl border border-white/15 bg-navy-950/70 p-5 text-center text-white backdrop-blur-md">
          <Box className="mx-auto size-8 text-gold-400" strokeWidth={1.5} />
          <p className="mt-3 font-display text-[16px] font-semibold">Modelo 3D em preparação</p>
          <p className="mt-1 text-[13px] text-white/70">Navegue pelos ambientes e pela planta enquanto preparamos o modelo.</p>
        </div>
      </div>
    </div>
  )
}
