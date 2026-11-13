import { db } from "@/lib/db";
import { json } from "@/lib/http";

/** Public: all editable site content as { key: value }. */
export async function GET(request: Request) {
  void request.url; // reads request data, so this is never prerendered
  const items = await db.contentItem.findMany();
  return json({ content: Object.fromEntries(items.map((i) => [i.key, i.value])) });
}
