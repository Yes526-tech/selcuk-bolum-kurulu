"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession, PRESET_USERS, DEFAULT_USER, isSelcukEmail } from "@/lib/auth";
import { RoleKey, checkRolePermission, PermissionAccess, ROLES } from "@/lib/permissions/matrix";

interface AuthContextType {
  user: UserSession;
  allPresetUsers: UserSession[];
  switchUser: (userId: string) => void;
  switchRole: (role: RoleKey) => void;
  login: (email: string) => { success: boolean; message?: string };
  logout: () => void;
  can: (permissionId: string) => { allowed: boolean; status: PermissionAccess; note: string };
  roleDefinition: typeof ROLES[RoleKey];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(DEFAULT_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("selcuk_auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Auth state restore error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const switchUser = (userId: string) => {
    const found = PRESET_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem("selcuk_auth_user", JSON.stringify(found));
    }
  };

  const switchRole = (role: RoleKey) => {
    const found = PRESET_USERS.find((u) => u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem("selcuk_auth_user", JSON.stringify(found));
    }
  };

  const login = (email: string): { success: boolean; message?: string } => {
    if (!isSelcukEmail(email)) {
      return {
        success: false,
        message: "Lütfen geçerli bir Selçuk Üniversitesi (@selcuk.edu.tr) kurumsal e-posta adresi giriniz.",
      };
    }
    const cleanEmail = email.trim().toLowerCase();
    const match = PRESET_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!match) {
      return {
        success: false,
        message: "Erişim Yetkisi Reddedildi! Yalnızca tanımlı fakülte akademik kadrosu sisteme giriş yapabilir.",
      };
    }
    setUser(match);
    localStorage.setItem("selcuk_auth_user", JSON.stringify(match));
    return { success: true };
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    localStorage.removeItem("selcuk_auth_user");
  };

  const can = (permissionId: string) => {
    return checkRolePermission(user.role, permissionId);
  };

  const roleDefinition = ROLES[user.role] || ROLES.OGRETIM_ELEMANI;

  return (
    <AuthContext.Provider
      value={{
        user,
        allPresetUsers: PRESET_USERS,
        switchUser,
        switchRole,
        login,
        logout,
        can,
        roleDefinition,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
