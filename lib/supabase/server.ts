import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * 服务端 Supabase 客户端。
 * 使用 service_role key（仅服务端可用，切勿暴露给浏览器），
 * 用于服务端查询与写入（如 AI 解释缓存）。
 */
export function createServerClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return client;
}
