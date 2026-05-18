export interface Recipe {
  id: string;
  name: string;
  category: string;
  imagePath: string;
  contentPath?: string;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  count: number;
  recipes: Recipe[];
}
