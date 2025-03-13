export interface User {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
    users_roles: {
      roles: {
        role: string;
      };
    }[];
  }