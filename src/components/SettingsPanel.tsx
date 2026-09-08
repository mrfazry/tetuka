type SettingsPanelProps = {
  open: boolean;
  autoUpdate: boolean;
  isDesktop: boolean;
  checking: boolean;
  onClose: () => void;
  onAutoUpdateChange: (value: boolean) => void;
  onCheckNow: () => void;
};

export function SettingsPanel({
  open,
  autoUpdate,
  isDesktop,
  checking,
  onClose,
  onAutoUpdateChange,
  onCheckNow,
}: SettingsPanelProps) {
  if (!open) return null;

  return (
    <div
      className="settings-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2 id="settings-title">Pengaturan</h2>
          <button type="button" className="secondary" onClick={onClose}>
            Tutup
          </button>
        </div>

        <label className="settings-row">
          <span>
            <strong>Pembaruan otomatis</strong>
            <em>
              {isDesktop
                ? "Periksa rilis baru saat aplikasi dibuka, lalu unduh dan mulai ulang."
                : "Hanya tersedia di aplikasi desktop."}
            </em>
          </span>
          <input
            type="checkbox"
            checked={autoUpdate}
            disabled={!isDesktop}
            onChange={(e) => onAutoUpdateChange(e.target.checked)}
          />
        </label>

        {isDesktop && (
          <button
            type="button"
            className="primary settings-check"
            disabled={checking}
            onClick={onCheckNow}
          >
            {checking ? "Memeriksa…" : "Periksa pembaruan"}
          </button>
        )}
      </div>
    </div>
  );
}
