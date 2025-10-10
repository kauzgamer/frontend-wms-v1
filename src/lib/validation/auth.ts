import { z } from 'zod';

// ========================================
// Schemas Zod para autenticação (frontend)
// Alinhado com backend: backend-wms/src/modules/auth/dto/auth.dto.ts
// ========================================

export const frontendLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

export const frontendRegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
});

export const frontendRefreshSchema = z.object({
  userId: z.string().uuid('userId deve ser um UUID válido'),
  refresh_token: z.string().min(1, 'refresh_token é obrigatório'),
});

// ========================================
// Tipos TypeScript inferidos
// ========================================

export type FrontendLoginInput = z.infer<typeof frontendLoginSchema>;
export type FrontendRegisterInput = z.infer<typeof frontendRegisterSchema>;
export type FrontendRefreshInput = z.infer<typeof frontendRefreshSchema>;
