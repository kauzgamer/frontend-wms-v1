import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Product } from "@/lib/types/product";
import type { ProductCreateForm } from "@/lib/validation/product";

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreateForm) =>
      apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify({
          name: data.name?.trim() || undefined,
          sku: data.sku?.trim() || undefined,
          unit: data.unit && data.unit.trim() !== "" ? data.unit : undefined,
          unitOfMeasure: data.unitOfMeasure?.trim() || undefined,
          organizationId: data.organizationId || undefined,
          externalCode: data.externalCode?.trim() || undefined,
          mobileDescription: data.mobileDescription?.trim() || undefined,
          category: data.category?.trim() || undefined,
          stockCharacteristics:
            data.stockCharacteristics && data.stockCharacteristics.length > 0
              ? data.stockCharacteristics
              : undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
