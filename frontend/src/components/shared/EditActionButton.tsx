import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';

interface EditActionButtonProps {
  canEdit: boolean;
  onClick: () => void;
  editLabel: string;
  expiredLabel: string;
}

export function EditActionButton({
  canEdit,
  onClick,
  editLabel,
  expiredLabel,
}: EditActionButtonProps) {
  return (
    <Tooltip title={canEdit ? editLabel : expiredLabel}>
      <span>
        <IconButton
          size="small"
          color="primary"
          aria-label={editLabel}
          disabled={!canEdit}
          onClick={onClick}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}
