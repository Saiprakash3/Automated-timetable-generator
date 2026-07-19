/** Standard error shape every endpoint uses on failure (Backend/API_CONTRACT.md § Conventions). */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
