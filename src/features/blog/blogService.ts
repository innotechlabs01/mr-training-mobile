import { goApiClient } from '@infrastructure/api/client';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
}

/** List blog posts */
export const listBlogPosts = async (): Promise<BlogPost[]> => {
  const { data } = await goApiClient.get<BlogPost[]>('/blog');
  return data;
};

/** Get a single blog post by ID */
export const getBlogPost = async (id: string): Promise<BlogPost> => {
  const { data } = await goApiClient.get<BlogPost>(`/blog/${id}`);
  return data;
};
