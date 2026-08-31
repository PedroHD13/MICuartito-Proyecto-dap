import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-cambiar-en-produccion";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas, igual que en el cliente

export const SESSION_COOKIE = "micuartito_session";

export interface ServerSession {
  username: string;
  role: "inquilino" | "propietario" | "admin";
  exp: number;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
}

export function createSessionToken(username: string, role: ServerSession["role"]): string {
  const payload: ServerSession = {
    username,
    role,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string | undefined): ServerSession | null {
  if (!token) return null;

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  // Si alguien intenta fabricar su propia cookie, la firma no va a coincidir
  if (sign(data) !== signature) return null;

  try {
    const payload: ServerSession = JSON.parse(Buffer.from(data, "base64url").toString());
    if (Date.now() > payload.exp) return null; // vencida
    return payload;
  } catch {
    return null;
  }
}
export async function getServerSession(): Promise<ServerSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}