# Fotos do painel/dashboard do mapa — Tank Control

O painel que aparece no mapa (`/brava/mapa`) ao clicar em um tanque ou
durante a "Apresentação" usa fotos deste caminho de duas formas:

1. Como alternativa de mídia principal quando o tanque não tem vídeo
   cadastrado em `public/videos/brava/tanques/<TAG>.mp4` (usa `1.jpg`).
2. Como uma pequena galeria de miniaturas no mini dashboard (avanço +
   comentário), lendo `1.jpg`, `2.jpg`, `3.jpg` e `4.jpg` — até 4 fotos por
   tanque, nenhuma obrigatória.

```
public/images/brava/tanques/<TAG>/1.jpg
public/images/brava/tanques/<TAG>/2.jpg
public/images/brava/tanques/<TAG>/3.jpg
public/images/brava/tanques/<TAG>/4.jpg
```

Exemplo: `public/images/brava/tanques/TQ-1222-25/1.jpg`.

## Atualização

Para trocar as fotos de um tanque, **substitua os arquivos mantendo os
mesmos caminhos** e faça o commit/push normalmente — mesma orientação do
README de vídeos (não acumula arquivo antigo na árvore de trabalho; o
histórico do git ainda guarda versões antigas, só isso).

## Formato

- Um tanque sem vídeo **e** sem nenhuma foto nesses caminhos mostra um
  cartão simples com status e avanço no lugar — nada quebra, e o tour segue
  para o próximo tanque normalmente.
- Formato recomendado: `.jpg`, proporção 16:9 (mesma do vídeo), leve o
  suficiente para não pesar o deploy.
- Cada foto é independente: faltar a `3.jpg` não impede a `1.jpg`/`2.jpg`/
  `4.jpg` de aparecerem — cada miniatura só desaparece se o próprio arquivo
  não existir.
