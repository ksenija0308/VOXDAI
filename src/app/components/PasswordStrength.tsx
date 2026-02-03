import { getPasswordStrength, getPasswordRequirements } from '@/utils/validation/authSchemas';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

export default function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const strength = getPasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#717182]">Password strength:</span>
          <span className="text-xs font-semibold" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
        <div className="w-full h-2 bg-[#e9ebef] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${strength.percentage}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1">
          <RequirementItem
            met={requirements.minLength}
            text="At least 8 characters"
          />
          <RequirementItem
            met={requirements.hasUppercase}
            text="One uppercase letter"
          />
          <RequirementItem
            met={requirements.hasLowercase}
            text="One lowercase letter"
          />
          <RequirementItem
            met={requirements.hasNumber}
            text="One number"
          />
          <RequirementItem
            met={requirements.hasSpecialChar}
            text="One special character (!@#$%^&*)"
          />
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="w-4 h-4 text-[#10b981]" />
      ) : (
        <X className="w-4 h-4 text-[#717182]" />
      )}
      <span
        className={`text-xs ${met ? 'text-[#10b981]' : 'text-[#717182]'}`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {text}
      </span>
    </div>
  );
}
