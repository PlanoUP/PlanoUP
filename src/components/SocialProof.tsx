/**
 * Prova social real. Fica desativado por padrão — nada aqui é inventado.
 * Ative `enabled: true` e preencha `items` assim que houver depoimentos,
 * avaliações ou números reais para exibir.
 */
const config = {
  enabled: false,
  items: [] as { name: string; role: string; quote: string }[],
};

export default function SocialProof() {
  if (!config.enabled || config.items.length === 0) return null;

  return (
    <section className="section-py bg-background">
      <div className="container-px mx-auto max-w-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {config.items.map((item) => (
            <div key={item.name} className="card-surface p-5">
              <p className="text-sm leading-relaxed text-white/90">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-4 text-xs font-semibold text-white">{item.name}</div>
              <div className="text-xs text-text-secondary">{item.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
