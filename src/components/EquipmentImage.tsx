"use client";

import { useState } from "react";
import Image from "next/image";
import EquipmentArt from "./EquipmentArt";

type Props = {
  src: string;
  slug: string;
  alt: string;
  sizes?: string;
  imageClassName?: string;
};

/**
 * Renderiza a imagem real do equipamento (public/images/*.png). Enquanto o
 * arquivo correspondente não existir, cai automaticamente no wireframe
 * técnico (EquipmentArt) — nenhuma troca de código é necessária quando as
 * imagens reais forem adicionadas.
 */
export default function EquipmentImage({ src, slug, alt, sizes, imageClassName }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="h-full w-full">
        <EquipmentArt slug={slug} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
      className={imageClassName ?? "object-contain"}
      onError={() => setErrored(true)}
    />
  );
}
