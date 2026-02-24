import React from 'react';
import { RecipeCard } from './RecipeCard';
import { Recipe } from '@/types';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (recipeId: string) => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({ recipes, onRecipeClick, favoriteIds, onToggleFavorite }) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400">
        <p>No recipes found in this category.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {recipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          onClick={onRecipeClick} 
          isFavorite={favoriteIds.has(recipe.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
