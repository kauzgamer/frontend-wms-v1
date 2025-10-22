import { useQuery } from "@tanstack/react-query";
import { getShipment, listShipments, type ListShipmentsParams, type ShipmentDocument } from "@/lib/api/shipments";

export function useShipments(params?: ListShipmentsParams) {
  return useQuery({
    queryKey: ["shipments", params ?? {}],
    queryFn: () => listShipments(params),
    staleTime: 30_000,
  });
}

export function useShipment(id?: string) {
  return useQuery<ShipmentDocument>({
    queryKey: ["shipments", id],
    queryFn: () => getShipment(id!),
    enabled: !!id,
  });
}
