import type { Model3DConfig } from '@/types/model3d'

/**
 * CONFIGURAÇÃO DOS MODELOS 3D — ajuste fino de câmera, planta e hotspots.
 *
 * Coordenadas de câmera são NORMALIZADAS pelo bounding box (ver types/model3d.ts):
 * [0, 0.5, 0] = centro do volume; eixo x = largura, y = altura, z = profundidade.
 * Os valores abaixo foram definidos a partir de renders do próprio modelo.
 *
 * Hotspots usam coordenadas ORIGINAIS do arquivo, extraídas da geometria nomeada
 * (ex.: centro do objeto "cooktop"), nunca estimadas "no olho".
 */

/** Casa mobiliada (SketchUp → Blender → GLB). 3 pavimentos, piscina, garagem. */
export const casaMobiliadaModel: Model3DConfig = {
  sizeBytes: 25_648_800,
  initialCamera: [1.0, 0.62, 0.62],
  target: [0, 0.3, 0.02],
  minDistance: 0.25,
  maxDistance: 2.4,
  autoRotate: true,
  // Pisos medidos na geometria: garagem (rodas do carro), cozinha (cooktop), superior (portas).
  planLevels: [
    { id: 'terreo', label: 'Térreo', cutHeight: 0.28, focusHeight: 0.15 },
    { id: 'social', label: 'Social', cutHeight: 0.55, focusHeight: 0.42 },
    { id: 'superior', label: 'Superior', cutHeight: 0.81, focusHeight: 0.68 },
  ],
  viewpoints: [
    { id: 'geral', label: 'Visão geral', position: [1.0, 0.62, 0.62], target: [0, 0.3, 0.02], fitAll: true },
    { id: 'fachada', label: 'Fachada', position: [1.05, 0.3, 0.12], target: [0.05, 0.35, 0] },
    { id: 'social', label: 'Área social', position: [0.55, 1.1, 0.75], target: [-0.15, 0.42, 0.22], cutHeight: 0.55 },
    { id: 'externa', label: 'Área externa', position: [0.75, 0.8, -0.85], target: [0, 0.12, -0.2] },
  ],
  hotspots: [
    {
      id: 'garagem',
      type: 'info',
      icon: 'car',
      // Centro do objeto "Carro Pintura".
      position: [11.38, 1.19, -6.97],
      title: 'Garagem coberta',
      description: 'Vaga coberta integrada à fachada, com acesso direto ao pavimento social.',
      visibleIn: ['exterior', 'plan', 'tour'],
      planLevelId: 'terreo',
      viewpointIds: ['geral', 'fachada'],
    },
    {
      id: 'cozinha',
      type: 'feature',
      icon: 'utensils',
      // Centro do objeto "cooktop".
      position: [9.38, 4.15, -6.05],
      title: 'Cozinha integrada',
      description: 'Cozinha aberta para a sala, com cooktop e bancada — o coração do pavimento social.',
      visibleIn: ['plan', 'tour'],
      planLevelId: 'social',
      viewpointIds: ['social'],
    },
    {
      id: 'banho-marmore',
      type: 'feature',
      icon: 'sparkles',
      // Centro do objeto "bancada-marmo".
      position: [9.1, 6.92, -7.92],
      title: 'Bancada em mármore',
      description: 'Banheiro do pavimento superior com bancada em mármore.',
      visibleIn: ['plan'],
      planLevelId: 'superior',
    },
  ],
}
