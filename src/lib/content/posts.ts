import "server-only";
import { postSchema, type Post } from "@/lib/validation/schemas";
import { cachedCollection } from "@/lib/content/cache";
import { visiblePosts } from "@/lib/content/post-visibility";

function parsePost(data: Record<string, unknown>): Post | null {
  const result = postSchema.safeParse(data);
  return result.success ? result.data : null;
}

/** Published, scheduled-in, not-expired posts; pinned first, then newest. */
export async function getPosts(): Promise<Post[]> {
  const posts = await cachedCollection("posts", parsePost)();
  return visiblePosts(posts, Date.now());
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
