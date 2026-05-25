import type z from 'zod';
import type { registerSchema } from '@/components/shadcn-space/blocks/register-01/register';
import type { loginSchema } from '@/components/shadcn-space/blocks/login-01/login';
import { useAuthStore } from './AuthStore';
import { http } from '@/lib/http';
import type { verifyEmailSchema } from '@/components/shadcn-space/blocks/verify-email-01/verify-email';
import type { User } from '../Users/user.type';


export class AuthService {
    static async register(data: z.infer<typeof registerSchema>) {
        const response = await http.post('/register', data);

        return response;
    }

    static async login(data: z.infer<typeof loginSchema>) {
        const response = await http.post('/login', data);

        const { user, token} = response.data;

        if(!token) {
            throw new Error('Token non trovato');
        }
        useAuthStore.getState().login(user, token);

        return response;
    }
    static async verifyEmail(data: z.infer<typeof verifyEmailSchema>) {
        const response = await http.post<{ token: string; user: User }>(
            "/auth/email-verify",
            data
          )
          if(!response.data.token){
            useAuthStore.getState().login(response.data.user, response.data.token); 
          }

          return response;
    }

    static async me() {
        const token = useAuthStore.getState().token
        return http.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    static async resendEmailVerify(email: string) {
        return http.post("/auth/resend-email-verify", { email })
      }
}