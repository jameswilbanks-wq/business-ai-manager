export interface Business {
  id: string;
  name: string;
  legalName: string | null;
  slug: string;
  logoUrl: string | null;
  defaultLanguage: "es" | "en";
  currency: string;
  timezone: string;
  country: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMembership {
  business: Business;
  roleName: string;
  isOwner: boolean;
}
