import { Eye, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export type RowActionsCellProps = {
  onView?: () => void;
  onEdit?: () => void;
  ariaLabel?: string;
};

export function RowActionsCell({
  onView,
  onEdit,
  ariaLabel = "Ações",
}: RowActionsCellProps) {
  return (
    <td className="px-2 text-center align-middle border-r sticky left-0 z-10 bg-white hover:bg-muted/30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="px-2.5 py-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#0c9abe] text-[#0c9abe] hover:bg-[#e3f5f9] font-bold text-lg leading-none"
            style={{ letterSpacing: "2px" }}
            onClick={(e) => e.stopPropagation()}
            aria-label={ariaLabel}
          >
            ...
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
          {onView && (
            <DropdownMenuItem onClick={onView}>
              <Eye className="size-4" /> Visualizar
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" /> Editar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}

export default RowActionsCell;
