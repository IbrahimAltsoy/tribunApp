export interface NewsDto {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  categoryId?: string;
  category?: NewsCategoryDto;
  authorId?: string;
  author?: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: string;
}

export interface NewsCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
