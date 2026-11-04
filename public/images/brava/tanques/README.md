# Fotos do tour automático do mapa — Tank Control

O painel de mídia que aparece durante o "Tour Automático" do mapa
(`/brava/mapa`) usa uma foto como alternativa quando o tanque não tem vídeo
cadastrado em `public/videos/brava/tanques/<TAG>.mp4`. Mesma lógica do
vídeo: um caminho fixo por TAG.

```
public/images/brava/tanques/<TAG>/1.jpg
```

Exemplo: `public/images/brava/tanques/TQ-1222-25/1.jpg`.

## Atualização

Para trocar a foto de um tanque, **substitua o arquivo mantendo o mesmo
caminho** e faça o commit/push normalmente — mesma orientação do README de
vídeos (não acumula arquivo antigo na árvore de trabalho; o histórico do
git ainda guarda versões antigas, só isso).

## Formato

- Um tanque sem vídeo **e** sem foto nesse caminho mostra um cartão simples
  com status e avanço no lugar — nada quebra, e o tour segue para o próximo
  tanque normalmente.
- Formato recomendado: `.jpg`, proporção 16:9 (mesma do vídeo), leve o
  suficiente para não pesar o deploy.
- Só é lido **um arquivo por tanque** (`1.jpg`) nesta primeira versão — não
  é uma galeria com várias fotos ainda.
