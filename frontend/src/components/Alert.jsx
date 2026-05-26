import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const variants = {
  info: {
    Icon: Info,
    wrap: 'bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-300',
    icon: 'text-blue-500',
  },
  success: {
    Icon: CheckCircle,
    wrap: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-500',
  },
  warning: {
    Icon: AlertTriangle,
    wrap: 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300',
    icon: 'text-amber-500',
  },
  error: {
    Icon: XCircle,
    wrap: 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300',
    icon: 'text-red-500',
  },
};

const Alert = ({ variant = 'info', title, children, className = '' }) => {
  const config = variants[variant] || variants.info;
  const Icon = config.Icon;

  return (
    <div
      role="alert"
      className={`rounded-md border p-4 ${config.wrap} ${className}`}
    >
      <div className="flex">
        <div className="shrink-0">
          <Icon aria-hidden="true" className={`size-5 ${config.icon}`} />
        </div>
        <div className="ml-3 text-sm">
          {title && <h3 className="font-semibold">{title}</h3>}
          <div className={title ? 'mt-1 leading-relaxed' : 'leading-relaxed'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
