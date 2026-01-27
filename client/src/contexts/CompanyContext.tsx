import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import API from "@/api/api";

/**
 * Represents the company object returned from the backend.
 */
export interface Company {
    _id: string;
    name: string;
    logo?: string;
    description?: string;
    industry?: string;
    website?: string;
    email?: string;
    address?: string;
    phone?: string;
    isVerified?: boolean;
    termsAccepted?: boolean;
    blocked?: boolean;
}

/**
 * Context type definition.
 */
interface CompanyContextType {
    company: Company | null;
    token: string | null;
    loading: boolean;
    login: (token: string, company: Company) => void;
    logout: () => void;
    refreshCompany: () => Promise<void>;
}

/**
 * Create a new context.
 */
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

/**
 * Provider component to wrap your app with.
 */
export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [company, setCompany] = useState<Company | null>(() => {
        const stored = localStorage.getItem("company_profile");
        return stored ? JSON.parse(stored) : null;
    });

    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("company_token")
    );

    const [loading, setLoading] = useState<boolean>(false);

    /** 🧩 Persist token changes */
    useEffect(() => {
        if (token) localStorage.setItem("company_token", token);
        else localStorage.removeItem("company_token");
    }, [token]);

    /** 🧩 Persist company profile changes */
    useEffect(() => {
        if (company) localStorage.setItem("company_profile", JSON.stringify(company));
        else localStorage.removeItem("company_profile");
    }, [company]);

    /**
     * Login method — saves token and company to state + localStorage.
     */
    const login = (tkn: string, cmp: Company) => {
        setToken(tkn);
        setCompany(cmp);
    };

    /**
     * Logout method — clears everything from localStorage and state.
     */
    const logout = () => {
        setToken(null);
        setCompany(null);
        localStorage.removeItem("company_token");
        localStorage.removeItem("company_profile");
    };

    /**
     * Refresh company data from backend (/api/companies/me)
     */
    const refreshCompany = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await API.get("/companies/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompany(res.data);
        } catch (err) {
            console.error("Error refreshing company profile:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    return (
        <CompanyContext.Provider
            value={{ company, token, loading, login, logout, refreshCompany }}
        >
            {children}
        </CompanyContext.Provider>
    );
};

/**
 * Custom hook for accessing the CompanyContext
 */
export const useCompany = (): CompanyContextType => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error("useCompany must be used within a CompanyProvider");
    }
    return context;
};
