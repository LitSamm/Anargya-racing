import { currentUser } from "@/lib/auth";
import { json } from "@/lib/http";

export async function GET(request: Request) {
  void request.url; // reads request data, so this is never prerendered
  return json({ user: await currentUser() });
}
