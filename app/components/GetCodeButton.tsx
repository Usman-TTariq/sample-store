'use client';

type GetCodeButtonProps = {
  label?: string;
  code?: string | null;
  isDeal?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function peekText(code?: string | null): string {
  const trimmed = code?.trim();
  if (!trimmed) return '••••';
  if (trimmed.length <= 4) return trimmed;
  return trimmed.slice(-4);
}

export default function GetCodeButton({
  label,
  code,
  isDeal = false,
  disabled = false,
  className = '',
  onClick,
}: GetCodeButtonProps) {
  const cta = (label || (isDeal ? 'Get Deal' : 'Get Code')).toUpperCase();

  // Deals: plain solid button — no peel / peel-hover
  if (isDeal) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`coupon-deal-btn ${className}`.trim()}
      >
        {cta}
      </button>
    );
  }

  // Codes: peel reveal on hover only
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`coupon-peel-btn ${className}`.trim()}
    >
      <span className="coupon-peel-code" aria-hidden>
        {peekText(code)}
      </span>
      <span className="coupon-peel-label">{cta}</span>
    </button>
  );
}
