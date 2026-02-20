export type HomologationStatus = "homologated" | "pending" | "rejected";

export interface Substitution {
  sapCode: string;
  brand: string;
  status: HomologationStatus;
}
