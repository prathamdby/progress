import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface GifPopupProps {
  isVisible: boolean;
  onClose: () => void;
  searchTerm: string;
}

interface PopupState {
  gif: string;
  position: { x: number; y: number };
  ready: boolean;
}

export const GifPopup = ({ isVisible, onClose, searchTerm }: GifPopupProps) => {
  const [state, setState] = useState<PopupState>({
    gif: "",
    position: { x: 0, y: 0 },
    ready: false,
  });

  const getRandomPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 340;
    const popupHeight = 340;
    const maxX = viewportWidth - popupWidth;
    const maxY = viewportHeight - popupHeight;
    const randomX = Math.max(20, Math.floor(Math.random() * maxX));
    const randomY = Math.max(20, Math.floor(Math.random() * maxY));
    return { x: randomX, y: randomY };
  };

  useEffect(() => {
    if (isVisible) {
      const fetchGif = async () => {
        try {
          const response = await fetch(
            `/api/gifs?q=${encodeURIComponent(searchTerm)}&t=${Date.now()}`,
            {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch GIF");
          }

          const data = await response.json();
          if (data.error) throw new Error(data.error);

          const img = new window.Image();
          img.src = data.gif;

          img.onload = () => {
            setState({
              gif: data.gif,
              position: getRandomPosition(),
              ready: true,
            });
          };
        } catch (error) {
          console.error("Failed to fetch GIF:", error);
          const fallbackGif =
            "https://media.tenor.com/hWyrzkGxeJEAAAAC/cat-angry.gif";
          const img = new window.Image();
          img.src = fallbackGif;

          img.onload = () => {
            setState({
              gif: fallbackGif,
              position: getRandomPosition(),
              ready: true,
            });
          };
        }
      };

      setState((prev) => ({ ...prev, ready: false }));
      fetchGif();
    }
  }, [isVisible, searchTerm]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isVisible && state.ready) {
      timer = setTimeout(() => {
        onClose();
      }, 3000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isVisible, state.ready, onClose]);

  return (
    <AnimatePresence>
      {isVisible && state.ready && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 pointer-events-none z-[9998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: state.position.x,
              y: state.position.y,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              x: window.outerWidth,
              y: window.outerHeight,
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
            className="fixed top-0 left-0 z-[9999] pointer-events-none"
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl w-[300px] h-[300px] bg-white">
              <Image
                src={state.gif}
                alt={`Random ${searchTerm} gif`}
                className="w-full h-full object-contain"
                width={300}
                height={300}
                unoptimized
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
