"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireEditorOrAdmin } from "@/lib/security/require-role";
import { postSchema } from "@/lib/validation/schemas";
import { sanitizePostBody } from "@/lib/content/sanitize";
import type { AdminFormState } from "@/components/admin/AdminForm";
import {
  formBoolean,
  formDate,
  formLocalized,
  formOptionalDate,
  formOptionalString,
  formString,
  formStringArray,
} from "@/lib/admin/form-data";

/**
 * Refreshes the public News list, every post page and the RSS feeds in all
 * locales, so a publish shows on the live site immediately (J6) rather
 * than after the 60 s ISR floor.
 */
function revalidatePostViews() {
  revalidatePath("/admin/posts");
  revalidatePath("/[locale]/news", "layout");
}

function readPostFields(data: FormData) {
  const body = formLocalized(data, "body");
  return {
    slug: formString(data, "slug"),
    type: formString(data, "type"),
    title: formLocalized(data, "title"),
    excerpt: formLocalized(data, "excerpt"),
    body: {
      fr: sanitizePostBody(body.fr),
      ar: body.ar ? sanitizePostBody(body.ar) : undefined,
      en: body.en ? sanitizePostBody(body.en) : undefined,
    },
    cover: formOptionalString(data, "cover"),
    tags: formStringArray(data, "tags"),
    projectSlug: formOptionalString(data, "projectSlug"),
    publishAt: formDate(data, "publishAt"),
    expiresAt: formOptionalDate(data, "expiresAt"),
    sponsorId: formOptionalString(data, "sponsorId"),
    pinned: formBoolean(data, "pinned"),
    published: formBoolean(data, "published"),
  };
}

export async function createPost(
  _prevState: AdminFormState,
  data: FormData,
): Promise<AdminFormState> {
  const session = await requireEditorOrAdmin();
  const fields = readPostFields(data);
  const db = getAdminDb();

  const existing = await db.collection("posts").doc(fields.slug).get();
  if (existing.exists) {
    return { error: `A post with slug "${fields.slug}" already exists` };
  }

  const parsed = postSchema.safeParse({
    ...fields,
    authorUid: session.uid,
    updatedBy: session.uid,
    updatedAt: new Date(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.collection("posts").doc(fields.slug).set(parsed.data);
  revalidatePostViews();
  redirect("/admin/posts");
}

export async function updatePost(
  slug: string,
  _prevState: AdminFormState,
  data: FormData,
): Promise<AdminFormState> {
  const session = await requireEditorOrAdmin();
  const db = getAdminDb();
  const existing = await db.collection("posts").doc(slug).get();
  if (!existing.exists) {
    return { error: "Post not found" };
  }

  const fields = readPostFields(data);
  const parsed = postSchema.safeParse({
    ...fields,
    slug,
    authorUid: existing.data()!.authorUid,
    updatedBy: session.uid,
    updatedAt: new Date(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.collection("posts").doc(slug).set(parsed.data);
  revalidatePostViews();
  redirect("/admin/posts");
}

export async function setPostPublished(slug: string, published: boolean) {
  const session = await requireEditorOrAdmin();
  await getAdminDb()
    .collection("posts")
    .doc(slug)
    .update({ published, updatedBy: session.uid, updatedAt: new Date() });
  revalidatePostViews();
}

export async function deletePost(slug: string) {
  await requireEditorOrAdmin();
  await getAdminDb().collection("posts").doc(slug).delete();
  revalidatePostViews();
}
