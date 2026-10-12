import { useEffect, useId, useRef } from 'react';

import { useI18n } from '../i18n/context';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  /** Label of the confirming button; defaults to "Delete". */
  actionLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal confirmation on the native `<dialog>`: `showModal` already traps
 * focus, makes the rest of the page inert and closes on Escape.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  actionLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="confirm" aria-labelledby={titleId} onCancel={onCancel}>
      <h3 id={titleId} className="confirm__title">
        {title}
      </h3>
      <p className="confirm__body">{body}</p>
      <div className="confirm__actions">
        <button type="button" className="button button--quiet" onClick={onCancel} autoFocus>
          {t('simConfirmCancel')}
        </button>
        <button type="button" className="button button--danger" onClick={onConfirm}>
          {actionLabel ?? t('simConfirmAction')}
        </button>
      </div>
    </dialog>
  );
}
