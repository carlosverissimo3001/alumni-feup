"use client";

import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/misc/useDebounce";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchUsers, UserSearchResult } from "@/hooks/admin/useSearchUsers";
import { useUpsertPermission } from "@/hooks/admin/useUpsertPermission";
import { useGetPermissions } from "@/hooks/admin/useGetPermissions";
import { useToast } from "@/hooks/misc/useToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle2,
  Circle,
  ExternalLink,
  UserCog,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const AVAILABLE_ACTIONS = ["read", "write"] as const;

const RESOURCES = [
  {
    id: "admin",
    label: "Admin Panel",
    description: "Access to the admin dashboard and its operations",
  },
] as const;

export default function ManagePermissionsPage() {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  const { user: currentUser } = useAuth();
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading: isSearching } = useSearchUsers(debouncedQuery);
  const { mutate: upsertPermission, isLoading: isSaving } = useUpsertPermission();
  const { data: existingPermissions, isLoading: isLoadingPermissions } = useGetPermissions(selectedUser?.id ?? null);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedUser || isLoadingPermissions) return;
    const mapped: Record<string, string[]> = {};
    for (const perm of existingPermissions) {
      mapped[perm.resource] = perm.actions;
    }
    setPermissions(mapped);
  }, [selectedUser, existingPermissions, isLoadingPermissions]);

  const handleSelectUser = useCallback((user: UserSearchResult) => {
    setSelectedUser(user);
    setQuery(user.fullName);
    setPermissions({});
  }, []);

  const toggleAction = useCallback((resource: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[resource] ?? [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: updated };
    });
  }, []);

  const handleSave = async () => {
    if (!selectedUser) return;

    const isSelf = currentUser?.id === selectedUser.id;
    const removingOwnAdminRead =
      isSelf &&
      !(permissions["admin"]?.includes("read") ?? false);

    if (removingOwnAdminRead) {
      toast({
        title: "You're about to revoke your own admin access",
        description: "You'll be redirected out of the admin panel immediately.",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all(
        RESOURCES.map(({ id: resource }) =>
          upsertPermission({
            upsertPermissionDto: {
              userId: selectedUser.id,
              resource,
              actions: permissions[resource] ?? [],
            },
          })
        )
      );
      toast({
        title: `Permissions updated for ${selectedUser.fullName}`,
        variant: "success",
      });
    } catch {
      toast({ title: "Failed to update permissions", variant: "destructive" });
    }
  };

  const showDropdown =
    debouncedQuery.trim().length >= 2 && !selectedUser && results.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin Panel
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <UserCog className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Manage Permissions</h1>
              <p className="text-sm text-gray-500">Search for a user, then assign permissions</p>
            </div>
          </div>
        </div>

        {/* Step 1: Search */}
        <div className="mb-8">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
            1 — Find user
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedUser && e.target.value !== selectedUser.fullName) {
                  setSelectedUser(null);
                  setPermissions({});
                }
              }}
              placeholder="Search by name..."
              className="pl-9 h-11 border-gray-200 focus:border-gray-400 focus:ring-0"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}

            {/* Dropdown results */}
            {showDropdown && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                    {user.linkedinUrl && (
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {debouncedQuery.trim().length >= 2 && !isSearching && results.length === 0 && !selectedUser && (
              <p className="absolute top-full left-0 mt-2 text-sm text-gray-400">
                No users found
              </p>
            )}
          </div>

          {/* Selected user pill */}
          {selectedUser && (
            <div className="mt-3 flex items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-300" />
                <span>{selectedUser.fullName}</span>
                {selectedUser.linkedinUrl && (
                  <a
                    href={selectedUser.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Permissions — only visible once a user is selected */}
        {selectedUser && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {isLoadingPermissions && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading existing permissions…
              </div>
            )}
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
              2 — Configure permissions
            </label>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {RESOURCES.map((resource) => (
                <div key={resource.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resource.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{resource.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {AVAILABLE_ACTIONS.map((action) => {
                        const active = permissions[resource.id]?.includes(action) ?? false;
                        return (
                          <button
                            key={action}
                            onClick={() => toggleAction(resource.id, action)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              active
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                            }`}
                          >
                            {active ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-3.5 w-3.5" />
                            )}
                            {action}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active summary */}
            {Object.entries(permissions).some(([, a]) => a.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(permissions)
                  .flatMap(([resource, actions]) =>
                    actions.map((action) => (
                      <Badge
                        key={`${resource}:${action}`}
                        variant="secondary"
                        className="text-xs font-mono"
                      >
                        {resource}:{action}
                      </Badge>
                    ))
                  )}
              </div>
            )}

            <div className="mt-6">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-700 text-white h-10 px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save permissions"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
