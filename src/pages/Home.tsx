import React, { useState, useMemo, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredRecipes = useMemo(() => {
    if (!normalizedSearch) return displayedRecipes;
    return displayedRecipes.filter(recipe => recipe.name.toLowerCase().includes(normalizedSearch));
  }, [displayedRecipes, normalizedSearch]);

  useEffect(() => {
    if (!selectedRecipe) return;
    const stillVisible = filteredRecipes.some(recipe => recipe.id === selectedRecipe.id);
    if (!stillVisible) {
      setSelectedRecipe(null);
    }
  }, [filteredRecipes, selectedRecipe]);

  // Modal Navigation Logic
  const handleNext = () => {
    if (!selectedRecipe) return;
    const currentIndex = filteredRecipes.findIndex(r => r.id === selectedRecipe.id);
    if (currentIndex < filteredRecipes.length - 1) {
      setSelectedRecipe(filteredRecipes[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedRecipe) return;
    const currentIndex = filteredRecipes.findIndex(r => r.id === selectedRecipe.id);
    if (currentIndex > 0) {
      setSelectedRecipe(filteredRecipes[currentIndex - 1]);
    }
  };

  const hasNext = selectedRecipe 
    ? filteredRecipes.findIndex(r => r.id === selectedRecipe.id) < filteredRecipes.length - 1 
    : false;

  const hasPrev = selectedRecipe 
    ? filteredRecipes.findIndex(r => r.id === selectedRecipe.id) > 0 
    : false;

  return (
    <Layout>
      <CategoryNav categories={categories} />
      
      <div className="mt-6">
        <div className="mb-6 px-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-stone-800">
            {categoryId 
              ? categories.find(c => c.id === categoryId)?.displayName || '分类' 
              : '所有菜谱'}
            <span className="text-stone-400 text-sm font-normal ml-3">
              ({filteredRecipes.length} 道菜)
            </span>
          </h1>
          <div className="w-full sm:w-72">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="输入关键词搜索菜谱"
              className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 shadow-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
        
        <RecipeGrid 
          recipes={filteredRecipes} 
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
