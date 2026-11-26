"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireEditorOrAdmin } from "@/lib/security/require-role";
import { platformSchema } from "@/lib/validation/schemas";
import type { AdminFormState } from "@/components/admin/AdminForm";
import {
  formBoolean,
  formLocalized,
  formNumber,
  formOptionalString,
  formString,
} from "@/lib/admin/form-data";

function readPlatformFields(data: FormData) {
  return {
    id: formString(data, "id"),
    name: formLocalized(data, "name"),
    description: formLocalized(data, "description"),
    url: formString(data, "url"),
    kind: formString(data, "kind"),
    projectSlug: formString(data, "projectSlug"),
    status: formString(data, "status"),
    screenshot: formOptionalString(data, "screenshot"),
    order: formNumber(data, "order"),
    published: formBoolean(data, "published"),
  };
}

export async function createPlatform(
  _prevState: AdminFormState,
  data: FormData,
): Promise<AdminFormState> {
  const session = await requireEditorOrAdmin();
  const fields = readPlatformFields(data);
  const db = getAdminDb();

  const existing = await db.collection("platforms").doc(fields.id).get();
  if (existing.exists) {
    return { error: `A platform with id "${fields.id}" already exists` };
  }

  const parsed = platformSchema.safeParse({
    ...fields,
    updatedBy: session.uid,
    updatedAt: new Date(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.collection("platforms").doc(fields.id).set(parsed.data);
  revalidatePath("/admin/platforms");
  // Platforms also appear on project pages.
  revalidatePath("/[locale]", "layout");
  redirect("/admin/platforms");
}

export async function updatePlatform(
  id: string,
  _prevState: AdminFormState,
  data: FormData,
): Promise<AdminFormState> {
  const session = await requireEditorOrAdmin();
  const db = getAdminDb();
  const fields = readPlatformFields(data);

  const parsed = platformSchema.safeParse({
    ...fields,
    id,
    updatedBy: session.uid,
    updatedAt: new Date(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.collection("platforms").doc(id).set(parsed.data);
  revalidatePath("/admin/platforms");
  // Platforms also appear on project pages.
  revalidatePath("/[locale]", "layout");
  redirect("/admin/platforms");
}

export async function setPlatformPublished(id: string, published: boolean) {
  const session = await requireEditorOrAdmin();
  await getAdminDb()
    .collection("platforms")
    .doc(id)
    .update({ published, updatedBy: session.uid, updatedAt: new Date() });
  revalidatePath("/admin/platforms");
  // Platforms also appear on project pages.
  revalidatePath("/[locale]", "layout");
}

export async function deletePlatform(id: string) {
  await requireEditorOrAdmin();
  await getAdminDb().collection("platforms").doc(id).delete();
  revalidatePath("/admin/platforms");
  // Platforms also appear on project pages.
  revalidatePath("/[locale]", "layout");
}
