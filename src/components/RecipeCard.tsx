import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Recipe } from '@/types';
import { withBaseUrl } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, isFavorite, onToggleFavorite }) => {
  const { ref } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group cursor-pointer break-inside-avoid mb-4"
      onClick={() => onClick(recipe)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div ref={ref} className="aspect-[9/16] bg-stone-200 relative">
          <img
            src={withBaseUrl(recipe.imagePath)}
            alt={recipe.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(recipe.id);
            }}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-2 text-stone-500 shadow-sm transition hover:bg-white"
            aria-label={isFavorite ? '取消收藏' : '收藏菜谱'}
          >
            <Heart size={18} className={isFavorite ? 'text-orange-500' : 'text-stone-400'} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="p-3">
          <h3 className="font-semibold text-stone-800 text-lg truncate">{recipe.name}</h3>
          <p className="text-xs text-stone-500 mt-1 capitalize">{recipe.category}</p>
        </div>
      </div>
    </motion.div>
  );
};
