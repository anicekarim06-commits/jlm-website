"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireEditorOrAdmin } from "@/lib/security/require-role";
import { projectSchema } from "@/lib/validation/schemas";
import type { AdminFormState } from "@/components/admin/AdminForm";
import {
  formBoolean,
  formCheckboxArray,
  formJson,
  formLocalized,
  formNumber,
  formOptionalString,
  formString,
  formStringArray,
} from "@/lib/admin/form-data";

function readProjectFields(data: FormData) {
  return {
    slug: formString(data, "slug"),
    poleSlug: formString(data, "poleSlug"),
    name: formLocalized(data, "name"),
    tagline: formLocalized(data, "tagline"),
    description: formLocalized(data, "description"),
    logo: formString(data, "logo"),
    cover: formOptionalString(data, "cover"),
    gallery: formStringArray(data, "gallery"),
    platformIds: formCheckboxArray(data, "platformIds"),
    stats: formJson(data, "stats") ?? [],
    leads: formJson(data, "leads"),
    order: formNumber(data, "order"),
    published: formBoolean(data, "published"),
  };
}

export async function createProject(
  _prevState: AdminFormState,
  data: FormData,
): Promise<AdminFormState> {
  const session = await requireEditorOrAdmin();
  const db = getAdminDb();
  let fields;
  try {
    fields = readProjectFields(data);
  } catch (error) {
    return { error: (error as Error).message };
  }

  const existing = await db.collection("projects").doc(fields.slug).get();
  if (existing.exists) {
    return { error: `A project with slug "${fields.slug}" already exists` };
  }

  const parsed = projectSchema.safeParse({
    ...fields,
    updatedBy: session.uid,
    updatedAt: new Date(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.collection("projects").doc(fields.slug).set(parsed.data);
  revalidatePath("/admin/projects");
  // Projects also appear on Home, pôle pages and Impact.
  revalidatePath("/[locale]", "layout");
  redirect("/admin/projects");
}

export async function updateProject(
  slug: string,
  _prevState: AdminFormState,
  data: FormData,
): Promise<AdminFormState> {
  const session = await requireEditorOrAdmin();
  const db = getAdminDb();
  let fields;
  try {
    fields = readProjectFields(data);
  } catch (error) {
    return { error: (error as Error).message };
  }

  const parsed = projectSchema.safeParse({
    ...fields,
    slug,
    updatedBy: session.uid,
    updatedAt: new Date(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.collection("projects").doc(slug).set(parsed.data);
  revalidatePath("/admin/projects");
  // Projects also appear on Home, pôle pages and Impact.
  revalidatePath("/[locale]", "layout");
  redirect("/admin/projects");
}

export async function setProjectPublished(slug: string, published: boolean) {
  const session = await requireEditorOrAdmin();
  await getAdminDb()
    .collection("projects")
    .doc(slug)
    .update({ published, updatedBy: session.uid, updatedAt: new Date() });
  revalidatePath("/admin/projects");
  // Projects also appear on Home, pôle pages and Impact.
  revalidatePath("/[locale]", "layout");
}

export async function deleteProject(slug: string) {
  await requireEditorOrAdmin();
  await getAdminDb().collection("projects").doc(slug).delete();
  revalidatePath("/admin/projects");
  // Projects also appear on Home, pôle pages and Impact.
  revalidatePath("/[locale]", "layout");
}
