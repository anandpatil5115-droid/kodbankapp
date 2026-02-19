import React, { useState } from 'react';

export default function InputField({
    label, type, placeholder, value, onChange,
    icon, isPassword = false, disabled = false, error = false,
}) {
    const [showPw, setShowPw] = useState(false);
    const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

    return (
        <div className="kb-group">
            <label className="kb-label">{label}</label>
            <div className="kb-input-wrap">
                <span className="kb-icon">{icon}</span>
                <input
                    className={`kb-input${isPassword ? ' has-toggle' : ''}${error ? ' error' : ''}`}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    autoComplete={type === 'email' ? 'email' : isPassword ? 'current-password' : type === 'tel' ? 'tel' : 'username'}
                    spellCheck={false}
                />
                <span className="kb-input-line" />
                {isPassword && (
                    <button
                        type="button" className="kb-pw-toggle"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPw(s => !s)} tabIndex={-1}
                    >
                        {showPw ? '🙈' : '👁'}
                    </button>
                )}
            </div>
        </div>
    );
}
