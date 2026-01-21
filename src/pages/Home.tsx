import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CategoryNav } from '@/components/CategoryNav';
import { RecipeGrid } from '@/components/RecipeGrid';
import { ImageModal } from '@/components/ImageModal';
import { Layout } from '@/components/Layout';
import recipeData from '@/data/recipes.json';
import { Category, Recipe } from '@/types';

// Cast the imported JSON to the correct type
const categories = recipeData as Category[];

export const Home: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Flatten all recipes for easier access and "All" view
  const allRecipes = useMemo(() => {
    return categories.flatMap(c => c.recipes);
  }, []);

  // Filter recipes based on current category
  const displayedRecipes = useMemo(() => {
    if (!categoryId) return allRecipes;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.recipes : [];
  }, [categoryId, allRecipes]);

  // Modal Navigation Logic
  const handleNext = () => {
    if (!selectedRecipe) return;
    const currentIndex = displayedRecipes.findIndex(r => r.id === selectedRecipe.id);
    if (currentIndex < displayedRecipes.length - 1) {
      setSelectedRecipe(displayedRecipes[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedRecipe) return;
    const currentIndex = displayedRecipes.findIndex(r => r.id === selectedRecipe.id);
    if (currentIndex > 0) {
      setSelectedRecipe(displayedRecipes[currentIndex - 1]);
    }
  };

  const hasNext = selectedRecipe 
    ? displayedRecipes.findIndex(r => r.id === selectedRecipe.id) < displayedRecipes.length - 1 
    : false;

  const hasPrev = selectedRecipe 
    ? displayedRecipes.findIndex(r => r.id === selectedRecipe.id) > 0 
    : false;

  return (
    <Layout>
      <CategoryNav categories={categories} />
      
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-stone-800 mb-6 px-2">
          {categoryId 
            ? categories.find(c => c.id === categoryId)?.displayName || '分类' 
            : '所有菜谱'}
          <span className="text-stone-400 text-sm font-normal ml-3">
            ({displayedRecipes.length} 道菜)
          </span>
        </h1>
        
        <RecipeGrid 
          recipes={displayedRecipes} 
          onRecipeClick={setSelectedRecipe} 
        />
      </div>

      <ImageModal
        isOpen={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </Layout>
  );
};
