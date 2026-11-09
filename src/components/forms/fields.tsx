import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "block w-full rounded-xl border border-border-strong bg-card px-4 text-[1rem] text-ink shadow-[inset_0_1px_1px_rgb(20_26_31/0.03)] transition-[border-color,box-shadow] placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10";

type FieldShellProps = { label: string; error?: string; hint?: string; optional?: boolean; children: (ids: { id: string; describedBy?: string }) => ReactNode };

export function FieldShell({ label, error, hint, optional, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children({ id, describedBy })}
      {hint && !error && <p id={hintId} className="mt-2 text-sm text-muted">{hint}</p>}
      {error && <p id={errorId} className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & { label: string; error?: string; hint?: string; optional?: boolean };

export function TextField({ label, error, hint, optional, className, ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional}>
      {({ id, describedBy }) => (
        <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "h-12", className)} {...props} />
      )}
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "id"> & { label: string; error?: string; hint?: string; optional?: boolean };

export function TextAreaField({ label, error, hint, optional, className, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional}>
      {({ id, describedBy }) => (
        <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "id"> & {
  label: string;
  error?: string;
  hint?: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
};

export function SelectField({ label, error, hint, placeholder, options, className, ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      {({ id, describedBy }) => (
        <div className="relative">
          <select id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "h-12 appearance-none pr-10", className)} {...props}>
            <option value="" disabled>{placeholder}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        </div>
      )}
    </FieldShell>
  );
}

type ChoiceGroupProps = {
  legend: string;
  name: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
  columns?: 2 | 3 | 4;
};

/** Radio buttons styled as selectable tiles. Native inputs keep keyboard and screen-reader behaviour intact. */
export function ChoiceGroup({ legend, name, value, options, onChange, error, columns = 2 }: ChoiceGroupProps) {
  const errorId = useId();
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className={cn("grid gap-2", columns === 2 && "grid-cols-2", columns === 3 && "grid-cols-2 sm:grid-cols-3", columns === 4 && "grid-cols-2 sm:grid-cols-4")}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "relative flex min-h-12 cursor-pointer items-center rounded-xl border px-4 py-3 text-[0.9375rem] transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/15",
              value === option.value ? "border-primary bg-primary-soft/60 text-ink" : "border-border-strong bg-card text-ink-soft hover:border-ink/25",
              error && value !== option.value && "border-danger/60",
            )}
          >
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="sr-only" />
            <span className={cn("mr-3 flex size-4 shrink-0 items-center justify-center rounded-full border", value === option.value ? "border-primary" : "border-border-strong")} aria-hidden="true">
              {value === option.value && <span className="size-2 rounded-full bg-primary" />}
            </span>
            {option.label}
          </label>
        ))}
      </div>
      {error && <p id={errorId} className="mt-2 text-sm text-danger">{error}</p>}
    </fieldset>
  );
}

type CheckboxFieldProps = { checked: boolean; onChange: (checked: boolean) => void; error?: string; children: ReactNode; name: string };

export function CheckboxField({ checked, onChange, error, children, name }: CheckboxFieldProps) {
  const id = useId();
  return (
    <div>
      <div className="flex gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-[var(--color-primary)]"
        />
        <label htmlFor={id} className="cursor-pointer text-[0.9375rem] leading-relaxed text-ink-soft">{children}</label>
      </div>
      {error && <p id={`${id}-error`} className="mt-2 pl-8 text-sm text-danger">{error}</p>}
    </div>
  );
}
