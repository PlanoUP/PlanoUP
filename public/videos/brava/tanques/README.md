# Vídeos de manutenção — Tank Control

O carrossel de vídeos que aparece no canto inferior direito do mapa (modo
tela cheia) lê um arquivo por TAG, sempre no mesmo caminho:

```
public/videos/brava/tanques/<TAG>.mp4
```

Exemplo: `public/videos/brava/tanques/TQ-1222-25.mp4`.

## Atualização semanal

Para trocar o vídeo de um tanque, **substitua o arquivo mantendo o mesmo
nome** (a TAG) e faça o commit/push normalmente — não crie um novo arquivo
com nome diferente. Isso garante que:

- a árvore de trabalho e o site publicado nunca acumulam vídeos antigos
  (o arquivo antigo simplesmente deixa de existir no commit novo);
- não é preciso alterar nenhum código — o carrossel já aponta para esse
  caminho fixo por TAG.

Importante: o **histórico do git** ainda guarda os vídeos antigos (é assim
que o git funciona). Se o tamanho do repositório em si virar um problema
com o tempo, isso exige uma limpeza de histórico separada (fora do fluxo
normal de commit/push) — não é algo que a troca semanal resolve sozinha.

## Formato

- Um tanque sem vídeo nesse caminho mostra "Vídeo não disponível" no
  carrossel — nada quebra, ele só pula para o próximo tanque em manutenção.
- Formato recomendado: `.mp4` (H.264), ~1 minuto, sem áudio (o player toca
  mudo/autoplay). Mantenha o arquivo o mais leve possível para não pesar o
  deploy.
