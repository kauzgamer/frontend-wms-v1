import { z } from "zod";

// Schema para atualização de perfil
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
  email: z
    .string()
    .email("E-mail inválido")
    .max(100, "E-mail deve ter no máximo 100 caracteres")
    .optional(),
  phone: z
    .string()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional(),
  jobTitle: z
    .string()
    .max(100, "Cargo deve ter no máximo 100 caracteres")
    .optional(),
  location: z
    .string()
    .max(100, "Localização deve ter no máximo 100 caracteres")
    .optional(),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
});

// Schema para atualização de senha
export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Senha atual deve ter pelo menos 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "Nova senha deve ter pelo menos 6 caracteres")
      .max(100, "Nova senha deve ter no máximo 100 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "Confirmação de senha deve ter pelo menos 6 caracteres")
      .max(100, "Confirmação de senha deve ter no máximo 100 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Schema para atualização de preferências
export const updatePreferencesSchema = z.object({
  language: z.enum(["pt-BR", "en-US", "es-ES"], "Idioma inválido").optional(),
  timezone: z
    .string()
    .max(50, "Timezone deve ter no máximo 50 caracteres")
    .optional(),
  theme: z.enum(["light", "dark", "system"], "Tema inválido").optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

// Tipos inferidos
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
