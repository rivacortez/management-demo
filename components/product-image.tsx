"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}

export function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
  onClick,
}: ProductImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle image click to open lightbox
  const handleImageClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Thumbnail image that opens lightbox when clicked */}
      <div 
        className={`relative cursor-pointer ${className}`}
        onClick={handleImageClick}
        role="button"
        tabIndex={0}
        aria-label={`Ver imagen de ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={200}
          height={200}
          className={className || "w-full h-auto object-cover"}
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Lightbox dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="sm:max-w-3xl p-1 bg-transparent border-none"
          aria-describedby="lightbox-description"
        >
          <DialogTitle>
            <VisuallyHidden>{`Imagen ampliada: ${alt}`}</VisuallyHidden>
          </DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={src}
              alt={alt}
              width={800}
              height={800}
              className="max-h-[80vh] w-auto object-contain rounded-md"
              priority
            />
          </div>
          <div id="lightbox-description" style={{ display: 'none' }}>
            Imagen ampliada en modo lightbox. Presione Escape para cerrar.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}