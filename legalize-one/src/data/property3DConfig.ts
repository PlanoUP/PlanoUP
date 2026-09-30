import type { Model3DConfig, Vec3 } from '@/types/model3d'

/**
 * CONFIGURAÇÃO DOS MODELOS 3D — composição inicial, planta, ambientes e hotspots.
 *
 * Câmeras usam coordenadas NORMALIZADAS pelo bounding box (ver types/model3d.ts):
 * [0, 0.5, 0] = centro do volume; eixo x = largura, y = altura, z = profundidade.
 * Para facilitar o ajuste, os pontos abaixo são escritos em METROS da cena
 * centralizada e convertidos por `m()` (valores tirados da geometria nomeada
 * do arquivo — ex.: "Sofa_en_L", "pia2" — e conferidos em renders).
 *
 * Hotspots usam coordenadas ORIGINAIS do arquivo (centro do objeto nomeado).
 */

/** Casa mobiliada — bounding box do arquivo: 26,44 × 10,64 × 26,63 m (terreno inteiro). */
const CASA_SIZE: Vec3 = [26.44, 10.64, 26.63]
const m = ([x, y, z]: Vec3): Vec3 => [x / CASA_SIZE[0], y / CASA_SIZE[1], z / CASA_SIZE[2]]

/** Casa mobiliada (SketchUp → Blender → GLB). 3 pavimentos, piscina, garagem. */
export const casaMobiliadaModel: Model3DConfig = {
  sizeBytes: 25_648_800,

  // Primeira visão e "Redefinir visão": perspectiva 3/4 pela fachada (lado da garagem),
  // levemente elevada, enquadrando a RESIDÊNCIA (não o terreno inteiro).
  presentation: {
    // Volume da casa: lajes, paredes e pórtico (objetos Geom3D016…033 + pórtico).
    focus: { min: m([-9.5, 1.2, -5.5]), max: m([2.7, 10.64, 11]) },
    azimuth: 34,
    elevation: 22,
    fill: 0.84,
  },
  // Planta centralizada no bloco construído (lajes x −9,5…2,6 · z 2,4…10,4), com respiro para o entorno.
  planFocus: { min: m([-11, 1.2, 0.5]), max: m([4.2, 10.64, 12.3]) },
  minDistance: 0.2,
  maxDistance: 1.8,

  // "Terreno": vista superior estável do lote inteiro, sem cortes (abre por padrão).
  // Pavimentos (opcionais, escolhidos pelo usuário): corte horizontal logo acima do mobiliário —
  // pisos medidos na geometria: térreo/garagem (y≈1,6 m), social (4,27 m), superior (7,19 m).
  planLevels: [
    { id: 'terreno', label: 'Terreno', focusHeight: 0.11, focus: { min: [-0.5, 0, -0.5], max: [0.5, 1, 0.5] } },
    { id: 'terreo', label: 'Térreo', cutHeight: 0.28, focusHeight: 0.15 },
    { id: 'social', label: 'Social', cutHeight: 0.55, focusHeight: 0.4 },
    { id: 'superior', label: 'Superior', cutHeight: 0.81, focusHeight: 0.68 },
  ],

  viewpoints: [
    {
      id: 'fachada',
      label: 'Fachada',
      description: 'Frente da casa, garagem e acesso',
      icon: 'facade',
      cameraPosition: m([25, 6.2, 7.5]),
      target: m([1.5, 5.2, 2.8]),
    },
    {
      id: 'sala',
      label: 'Sala',
      description: 'Estar com sofá em L — pavimento social',
      icon: 'living',
      // Sofá "Sofa_en_L": x −8,2…−5,3 · z 7,3…9,2 · piso social y 4,27. Olhar de dentro da casa
      // para o canto do estar (lado oposto ao da cozinha), com corte acima do mobiliário.
      cameraPosition: m([2.5, 13.5, -0.5]),
      target: m([-6.2, 4.4, 7.4]),
      cutHeight: 0.58,
    },
    {
      id: 'cozinha',
      label: 'Cozinha',
      description: 'Cozinha integrada com cooktop e bancada',
      icon: 'kitchen',
      // Bancada "pia2": x −4,5…−1,9 · z 4,9…9,9 · cooktop em (−3,8; 5,4; 7,3).
      cameraPosition: m([4.5, 13.5, 13]),
      target: m([-3.2, 4.5, 6.6]),
      cutHeight: 0.58,
    },
    {
      id: 'externa',
      label: 'Área externa',
      description: 'Piscina, deck e jardim',
      icon: 'outdoor',
      // Deck/piscina ("Geom3D013"): x −6,4…7,1 · z −9,4…−1,1.
      cameraPosition: m([21, 12.5, -26]),
      target: m([-0.5, 2.6, -4.2]),
    },
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
      visibleIn: ['overview', 'plan', 'rooms'],
      planLevelId: 'terreo',
      viewpointIds: ['fachada'],
    },
    {
      id: 'cozinha',
      type: 'feature',
      icon: 'utensils',
      // Centro do objeto "cooktop".
      position: [9.38, 4.15, -6.05],
      title: 'Cozinha integrada',
      description: 'Cozinha aberta para a sala, com cooktop e bancada — o coração do pavimento social.',
      visibleIn: ['plan', 'rooms'],
      planLevelId: 'social',
      viewpointIds: ['cozinha', 'sala'],
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
