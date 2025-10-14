import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export type DataTableHeaderProps = {
  title: string;
  width?: number | string;
  onHide?: () => void;
  extraMenuItems?: Array<{ label: string; onClick: () => void }>;
};

export function DataTableHeader({
  title,
  width,
  onHide,
  extraMenuItems,
}: DataTableHeaderProps) {
  return (
    <th
      className="p-3 font-medium text-xs whitespace-nowrap"
      style={width ? { width } : undefined}
    >
      <div className="relative flex items-center justify-between gap-2">
        <span className="text-cyan-700 truncate">{title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="text-cyan-700 hover:bg-cyan-50 rounded p-1 flex-shrink-0"
              aria-label={`Opções da coluna ${title}`}
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onHide && (
              <DropdownMenuItem onClick={onHide}>
                Ocultar coluna
              </DropdownMenuItem>
            )}
            {extraMenuItems?.map((item) => (
              <DropdownMenuItem key={item.label} onClick={item.onClick}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </th>
  );
}

export default DataTableHeader;
