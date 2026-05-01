/** Skeleton card — mimics a MenuCard while data loads */
export function MenuCardSkeleton() {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '16px' }} />
      <div className="skeleton" style={{ height: '18px', width: '70%' }} />
      <div className="skeleton" style={{ height: '13px', width: '100%' }} />
      <div className="skeleton" style={{ height: '13px', width: '80%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <div className="skeleton" style={{ height: '20px', width: '60px' }} />
        <div className="skeleton" style={{ height: '36px', width: '36px', borderRadius: '10px' }} />
      </div>
    </div>
  );
}

/** Skeleton stat card */
export function StatCardSkeleton() {
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
      <div className="skeleton" style={{ height: '32px', width: '60%' }} />
      <div className="skeleton" style={{ height: '14px', width: '80%' }} />
    </div>
  );
}

/** Skeleton list row */
export function ListRowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '14px', width: '40%' }} />
        <div className="skeleton" style={{ height: '12px', width: '65%' }} />
      </div>
      <div className="skeleton" style={{ height: '24px', width: '70px', borderRadius: '999px' }} />
    </div>
  );
}
