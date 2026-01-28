import React, { useMemo, useState } from "react";

type SkillsInputProps = {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
    inputClassName?: string;
    chipClassName?: string;
    containerClassName?: string;
};

const normalizeSkills = (skills: string[]) => {
    const seen = new Set<string>();
    const result: string[] = [];
    skills.forEach((raw) => {
        const trimmed = raw.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        result.push(trimmed);
    });
    return result;
};

const splitSkills = (value: string) =>
    value
        .split(/[,\n]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

const SkillsInput: React.FC<SkillsInputProps> = ({
    value,
    onChange,
    placeholder = "Add a skill and press comma",
    inputClassName = "",
    chipClassName = "",
    containerClassName = "",
}) => {
    const [inputValue, setInputValue] = useState("");

    const safeValue = useMemo(() => normalizeSkills(value || []), [value]);

    const addSkills = (raw: string) => {
        const parts = splitSkills(raw);
        if (!parts.length) return;
        const next = normalizeSkills([...safeValue, ...parts]);
        onChange(next);
    };

    const handleChange = (nextValue: string) => {
        if (nextValue.includes(",") || nextValue.includes("\n")) {
            const parts = splitSkills(nextValue);
            const hasTrailingSeparator = /[,\n]\s*$/.test(nextValue);
            if (parts.length) {
                addSkills(parts.join(","));
            }
            setInputValue(hasTrailingSeparator ? "" : parts[parts.length - 1] || "");
            return;
        }
        setInputValue(nextValue);
    };

    const commitInput = () => {
        if (!inputValue.trim()) return;
        addSkills(inputValue);
        setInputValue("");
    };

    return (
        <div className={containerClassName}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        commitInput();
                    }
                }}
                onBlur={commitInput}
                placeholder={placeholder}
                className={inputClassName}
            />
            {safeValue.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {safeValue.map((skill, idx) => (
                        <span
                            key={`${skill}-${idx}`}
                            className={
                                chipClassName ||
                                "rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                            }
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillsInput;
