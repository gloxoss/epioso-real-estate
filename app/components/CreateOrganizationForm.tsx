"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("create_organization", { p_name: name });
      if (error) throw error;
      setSuccess(`Created org: ${data?.name ?? name}`);
      setName("");
    } catch (err: any) {
      setError(err.message ?? "Failed to create organization");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        className="border px-2 py-1 rounded min-w-64"
        placeholder="Organization name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="rounded bg-foreground text-background px-3 py-1 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Organization"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
      {success && <span className="text-green-600 text-sm">{success}</span>}
    </form>
  );
}

