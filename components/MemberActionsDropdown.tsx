"use client";

import { useTransition, useState } from "react";
import { Icon } from "@/components/Icon";
import { deleteMemberAction, updateMemberRoleAction, resetUserPasswordAction } from "@/app/admin/members/actions";

type MemberActionsProps = {
  memberId: string;
  memberName: string;
  currentRole: "student" | "librarian" | "admin" | string;
};

export function MemberActionsDropdown({ memberId, memberName, currentRole }: MemberActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [roleError, setRoleError] = useState("");
  const [roleSuccess, setRoleSuccess] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus profil anggota "${memberName}"?`)) {
      startTransition(async () => {
        const result = await deleteMemberAction(memberId);
        if (result?.error) {
          alert(`Gagal: ${result.error}`);
        }
      });
      setIsOpen(false);
    }
  };

  const handleEditRoleClick = () => {
    setRoleModalOpen(true);
    setIsOpen(false);
    setSelectedRole(currentRole);
    setRoleError("");
    setRoleSuccess(false);
  };

  const submitEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!["student", "teacher", "librarian", "admin"].includes(selectedRole)) {
      setRoleError("Role tidak valid.");
      return;
    }
    setRoleError("");

    startTransition(async () => {
      const result = await updateMemberRoleAction(memberId, selectedRole as any);
      if (result?.error) {
        setRoleError(result.error);
      } else {
        setRoleSuccess(true);
      }
    });
  };

  const handleResetPasswordClick = () => {
    setResetModalOpen(true);
    setIsOpen(false);
    setNewPassword("");
    setResetError("");
    setResetSuccess(false);
  };

  const submitResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError("Password minimal 6 karakter!");
      return;
    }
    setResetError("");

    startTransition(async () => {
      const result = await resetUserPasswordAction(memberId, newPassword);
      if (result?.error) {
        setResetError(result.error);
      } else {
        setResetSuccess(true);
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
      >
        <Icon name={isPending ? "hourglass_empty" : "more_horiz"} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 flex w-56 flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <button
              onClick={handleEditRoleClick}
              className="flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-on-surface transition hover:bg-surface-container-low"
            >
              <Icon name="manage_accounts" className="text-[18px]" />
              Edit Role
            </button>
            <button
              onClick={handleResetPasswordClick}
              className="flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-on-surface transition hover:bg-surface-container-low"
            >
              <Icon name="password" className="text-[18px]" />
              Reset Password
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-3 border-t border-surface-container-low px-4 py-3 text-left text-sm font-semibold text-error transition hover:bg-error-container"
            >
              <Icon name="delete" className="text-[18px]" />
              Hapus Anggota
            </button>
          </div>
        </>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && setResetModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-primary">
                <Icon name="password" className="text-3xl" />
              </div>
              <h2 className="text-center font-headline text-2xl font-extrabold text-gray-900">
                Reset Password
              </h2>
              <p className="mt-2 text-center text-sm text-on-surface-variant">
                Atur ulang kata sandi untuk <br />
                <strong className="text-gray-900">{memberName}</strong>
              </p>
            </div>

            {resetSuccess ? (
              <div className="text-center">
                <div className="mb-6 rounded-xl bg-green-100 p-4 text-sm font-medium text-green-800">
                  Password berhasil diubah!
                </div>
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="w-full rounded-full bg-surface-container px-6 py-3.5 font-bold text-on-surface transition hover:bg-surface-container-high"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={submitResetPassword} className="space-y-4">
                <label className="block">
                  <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                    Password Baru <span className="text-error">*</span>
                  </span>
                  <input
                    className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
                    placeholder="Minimal 6 karakter"
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isPending}
                  />
                </label>

                {resetError && (
                  <p className="rounded-xl bg-error-container/20 p-3 text-sm text-error">
                    {resetError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="flex-1 rounded-full bg-surface-container px-6 py-3.5 font-bold text-on-surface transition hover:bg-surface-container-high"
                    type="button"
                    disabled={isPending}
                  >
                    Batal
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-3.5 font-bold text-white shadow-soft transition hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Icon name="hourglass_empty" className="text-lg animate-spin" />
                    ) : (
                      "Simpan"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && setRoleModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-primary">
                <Icon name="manage_accounts" className="text-3xl" />
              </div>
              <h2 className="text-center font-headline text-2xl font-extrabold text-gray-900">
                Edit Role
              </h2>
              <p className="mt-2 text-center text-sm text-on-surface-variant">
                Ubah hak akses sistem untuk <br />
                <strong className="text-gray-900">{memberName}</strong>
              </p>
            </div>

            {roleSuccess ? (
              <div className="text-center">
                <div className="mb-6 rounded-xl bg-green-100 p-4 text-sm font-medium text-green-800">
                  Role berhasil diubah menjadi <strong className="uppercase">{selectedRole}</strong>!
                </div>
                <button
                  onClick={() => setRoleModalOpen(false)}
                  className="w-full rounded-full bg-surface-container px-6 py-3.5 font-bold text-on-surface transition hover:bg-surface-container-high"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={submitEditRole} className="space-y-4">
                <label className="block">
                  <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                    Pilih Role <span className="text-error">*</span>
                  </span>
                  <select
                    className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="student">Siswa</option>
                    <option value="teacher">Guru</option>
                    <option value="librarian">Pustakawan</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                {roleError && (
                  <p className="rounded-xl bg-error-container/20 p-3 text-sm text-error">
                    {roleError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRoleModalOpen(false)}
                    className="flex-1 rounded-full bg-surface-container px-6 py-3.5 font-bold text-on-surface transition hover:bg-surface-container-high"
                    type="button"
                    disabled={isPending}
                  >
                    Batal
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-3.5 font-bold text-white shadow-soft transition hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Icon name="hourglass_empty" className="text-lg animate-spin" />
                    ) : (
                      "Simpan"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
