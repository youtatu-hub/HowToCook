import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, FileText, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '@/types';
import { withBaseUrl } from '@/lib/utils';
import { MarkdownDocument } from './MarkdownDocument';

interface ImageModalProps {
  isOpen: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  recipe,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isFavorite,
  onToggleFavorite,
}) => {
  const [showDocument, setShowDocument] = useState(true);
  const [markdownContent, setMarkdownContent] = useState('');
  const [markdownStatus, setMarkdownStatus] = useState<'idle' | 'loading' | 'ready' | 'missing' | 'error'>('idle');

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && hasNext) onNext();
    if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    if (e.key.toLowerCase() === 'm') setShowDocument((prev) => !prev);
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowDocument(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !recipe) return;

    setMarkdownContent('');
    if (!recipe.contentPath) {
      setMarkdownStatus('missing');
      return;
    }

    const controller = new AbortController();
    setMarkdownStatus('loading');

    fetch(withBaseUrl(recipe.contentPath), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('markdown-not-found');
        }
        return response.text();
      })
      .then((content) => {
        setMarkdownContent(content);
        setMarkdownStatus('ready');
      })
      .catch((error: Error) => {
        if (error.name === 'AbortError') return;
        setMarkdownStatus('error');
      });

    return () => controller.abort();
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-stone-950/95 p-2 backdrop-blur-md sm:p-4"
        onClick={onClose}
      >
        <div 
          className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-stone-950/70 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-stone-950/80 px-3 sm:h-16 sm:px-5">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-white sm:text-lg">{recipe.name}</h2>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-white/45">{recipe.category}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setShowDocument((prev) => !prev)}
                disabled={!recipe.contentPath}
                className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition ${
                  recipe.contentPath
                    ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                    : 'cursor-not-allowed border-white/10 bg-white/5 text-white/35'
                }`}
                aria-label={showDocument ? '隐藏文档' : '显示文档'}
              >
                {showDocument ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                <span className="hidden sm:inline">{showDocument ? '隐藏文档' : '显示文档'}</span>
              </button>
              <button
                onClick={() => onToggleFavorite(recipe.id)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
                aria-label={isFavorite ? '取消收藏' : '收藏菜谱'}
              >
                <Heart size={19} className={isFavorite ? 'text-orange-300' : 'text-white'} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
                aria-label="关闭"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div className={`grid min-h-0 flex-1 gap-3 p-3 sm:gap-4 sm:p-4 ${showDocument ? 'lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]' : 'lg:grid-cols-1'}`}>
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {/* Image Container */}
              <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4">
                {/* Navigation Buttons */}
                {hasPrev && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-stone-950/45 text-white shadow-lg backdrop-blur transition hover:bg-stone-900/80 md:flex"
                    aria-label="上一张"
                  >
                    <ChevronLeft size={28} />
                  </button>
                )}
                
                {hasNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-stone-950/45 text-white shadow-lg backdrop-blur transition hover:bg-stone-900/80 md:flex"
                    aria-label="下一张"
                  >
                    <ChevronRight size={28} />
                  </button>
                )}

                <motion.img
                  key={recipe.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={withBaseUrl(recipe.imagePath)}
                  alt={recipe.name}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                />
                
                {/* Mobile Navigation Overlays */}
                <div className="absolute inset-y-0 left-0 w-1/4 md:hidden" onClick={(e) => {
                  e.stopPropagation();
                  if (hasPrev) onPrev();
                }} />
                <div className="absolute inset-y-0 right-0 w-1/4 md:hidden" onClick={(e) => {
                  e.stopPropagation();
                  if (hasNext) onNext();
                }} />
              </div>

              {/* Footer Info */}
              <div className="border-t border-white/10 bg-stone-950/45 px-4 py-3 text-center">
                <h3 className="text-lg font-semibold text-white">{recipe.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/45">{recipe.category}</p>
              </div>
            </div>

            {showDocument && (
              <aside className="flex max-h-[46vh] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-[#fffaf4] shadow-[0_24px_90px_rgba(0,0,0,0.35)] lg:max-h-none">
                <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 bg-white/75 px-5 py-4 backdrop-blur">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-orange-700">
                      <FileText size={15} />
                      <span>菜谱文档</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-950">{recipe.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDocument(false)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/80 hover:text-stone-800"
                    aria-label="隐藏文档"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="recipe-doc-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  {markdownStatus === 'loading' && (
                    <div className="space-y-3">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-stone-200" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-stone-200" />
                    </div>
                  )}
                  {markdownStatus === 'missing' && (
                    <p className="rounded-xl bg-white/70 p-4 text-sm text-stone-500">当前菜谱暂未关联 Markdown 文档。</p>
                  )}
                  {markdownStatus === 'error' && (
                    <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">菜谱文档加载失败。</p>
                  )}
                  {markdownStatus === 'ready' && (
                    <MarkdownDocument content={markdownContent} />
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
