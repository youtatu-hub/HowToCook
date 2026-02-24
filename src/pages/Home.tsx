import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CategoryNav } from '@/components/CategoryNav';
import { RecipeGrid } from '@/components/RecipeGrid';
import { ImageModal } from '@/components/ImageModal';
import { Layout } from '@/components/Layout';
import recipeData from '@/data/recipes.json';
import { Category, Recipe } from '@/types';
import { withBaseUrl } from '@/lib/utils';

// Cast the imported JSON to the correct type
const categories = recipeData as Category[];

export const Home: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingLong, setIsExportingLong] = useState(false);
  const [exportError, setExportError] = useState('');

  // Flatten all recipes for easier access and "All" view
  const allRecipes = useMemo(() => {
    return categories.flatMap(c => c.recipes);
  }, []);

  const recipeMap = useMemo(() => new Map(allRecipes.map(recipe => [recipe.id, recipe])), [allRecipes]);

  // Filter recipes based on current category
  const displayedRecipes = useMemo(() => {
    if (!categoryId) return allRecipes;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.recipes : [];
  }, [categoryId, allRecipes]);

  useEffect(() => {
    const stored = localStorage.getItem('howtocook:favorites');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.filter((id) => typeof id === 'string'));
      }
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('howtocook:favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const favoriteRecipes = useMemo(
    () => favoriteIds.map(id => recipeMap.get(id)).filter((recipe): recipe is Recipe => !!recipe),
    [favoriteIds, recipeMap],
  );

  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredRecipes = useMemo(() => {
    let base = displayedRecipes;
    if (showFavoritesOnly) {
      base = base.filter(recipe => favoriteIdSet.has(recipe.id));
    }
    if (!normalizedSearch) return base;
    return base.filter(recipe => recipe.name.toLowerCase().includes(normalizedSearch));
  }, [displayedRecipes, normalizedSearch, showFavoritesOnly, favoriteIdSet]);

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

  const toggleFavorite = (recipeId: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      }
      return [...prev, recipeId];
    });
  };

  const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image-load-failed'));
      img.src = src;
    });
  };

  const handleExportPdf = async () => {
    if (favoriteRecipes.length === 0 || isExporting) return;
    setIsExporting(true);
    setExportError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      for (const recipe of favoriteRecipes) {
        const imageUrl = withBaseUrl(recipe.imagePath);
        const response = await fetch(imageUrl);
        if (!response.ok) {
          continue;
        }
        const bytes = await response.arrayBuffer();
        const extension = recipe.imagePath.split('.').pop()?.toLowerCase();
        const embedded = extension === 'png'
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);
        const { width, height } = embedded.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embedded, { x: 0, y: 0, width, height });
      }
      const pdfBytes = await pdfDoc.save();
      const pdfData = Uint8Array.from(pdfBytes);
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `私人菜谱-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('导出失败，请稍后再试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLongImage = async () => {
    if (favoriteRecipes.length === 0 || isExportingLong) return;
    setIsExportingLong(true);
    setExportError('');
    try {
      const images = await Promise.all(
        favoriteRecipes.map((recipe) => loadImage(withBaseUrl(recipe.imagePath)))
      );
      if (images.length === 0) {
        setExportError('没有可用的图片');
        return;
      }
      const widths = images.map((img) => img.naturalWidth || img.width);
      const heights = images.map((img) => img.naturalHeight || img.height);
      const targetWidth = Math.max(...widths);
      const scaledHeights = images.map((img, index) => {
        const width = widths[index];
        const height = heights[index];
        return Math.round((height * targetWidth) / width);
      });
      const totalHeight = scaledHeights.reduce((sum, value) => sum + value, 0);
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setExportError('长图导出失败，请稍后再试');
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let offsetY = 0;
      images.forEach((img, index) => {
        const height = scaledHeights[index];
        ctx.drawImage(img, 0, offsetY, targetWidth, height);
        offsetY += height;
      });
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (value) {
            resolve(value);
          } else {
            reject(new Error('blob-failed'));
          }
        }, 'image/jpeg', 0.92);
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `私人菜谱-长图-${new Date().toISOString().slice(0, 10)}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('长图导出失败，请稍后再试');
    } finally {
      setIsExportingLong(false);
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

        <div className="mb-6 px-2 flex flex-wrap items-center gap-2 text-sm text-stone-600">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">已收藏 {favoriteIds.length} 道菜</span>
          <button
            type="button"
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={`rounded-full px-3 py-1 transition ${showFavoritesOnly ? 'bg-orange-500 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
          >
            只看收藏
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={favoriteRecipes.length === 0 || isExporting}
            className={`rounded-full px-3 py-1 transition ${favoriteRecipes.length === 0 || isExporting ? 'bg-stone-200 text-stone-400' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
          >
            {isExporting ? '正在导出...' : '导出 PDF'}
          </button>
          <button
            type="button"
            onClick={handleExportLongImage}
            disabled={favoriteRecipes.length === 0 || isExportingLong}
            className={`rounded-full px-3 py-1 transition ${favoriteRecipes.length === 0 || isExportingLong ? 'bg-stone-200 text-stone-400' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
          >
            {isExportingLong ? '正在导出长图...' : '导出长图'}
          </button>
          <button
            type="button"
            onClick={() => setFavoriteIds([])}
            disabled={favoriteIds.length === 0}
            className={`rounded-full px-3 py-1 transition ${favoriteIds.length === 0 ? 'bg-stone-200 text-stone-400' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'}`}
          >
            清空收藏
          </button>
          {exportError && (
            <span className="text-red-500">{exportError}</span>
          )}
        </div>
        
        <RecipeGrid 
          recipes={filteredRecipes} 
          onRecipeClick={setSelectedRecipe} 
          favoriteIds={favoriteIdSet}
          onToggleFavorite={toggleFavorite}
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
        isFavorite={selectedRecipe ? favoriteIdSet.has(selectedRecipe.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </Layout>
  );
};
