import type { Post } from "@/lib/validation/schemas";

/**
 * Pure scheduling rules for posts (master plan Section 8.4), kept free of
 * Firestore/`server-only` so they can be unit tested directly.
 *
 * A post is public when it is published, its `publishAt` has passed, and
 * its `expiresAt` (used for ads) has not.
 */
export function isPostVisible(post: Post, now: number): boolean {
  if (!post.published) return false;
  if (post.publishAt.getTime() > now) return false;
  if (post.expiresAt && post.expiresAt.getTime() <= now) return false;
  return true;
}

/** Pinned first, then newest first. */
export function comparePosts(a: Post, b: Post): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return b.publishAt.getTime() - a.publishAt.getTime();
}

export function visiblePosts(posts: Post[], now: number): Post[] {
  return posts.filter((p) => isPostVisible(p, now)).sort(comparePosts);
}

/**
 * Up to `limit` other posts, preferring the same project, then the same
 * type, then anything recent. Input is assumed already visible + sorted.
 */
export function relatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  const others = posts.filter((p) => p.slug !== post.slug);
  const score = (p: Post) =>
    (post.projectSlug && p.projectSlug === post.projectSlug ? 2 : 0) +
    (p.type === post.type ? 1 : 0);
  return [...others]
    .sort((a, b) => score(b) - score(a) || comparePosts(a, b))
    .slice(0, limit);
}
