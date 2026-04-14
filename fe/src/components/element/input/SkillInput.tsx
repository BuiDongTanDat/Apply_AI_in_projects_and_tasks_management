import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SkillInputProps {
  value?: string[] | null;
  onChange?: (skills: string[]) => void;
  suggestions?: string[];
  disabled?: boolean;
  maxSkills?: number;
  maxSkillLength?: number;
  placeholder?: string;
}

const normalizeSkill = (value: string) => value.trim().replace(/\s+/g, " ");

const toComparableSkill = (value: string) =>
  normalizeSkill(value).toLowerCase();

export function SkillInput({
  value = [],
  onChange,
  suggestions = [],
  disabled = false,
  maxSkills = 20,
  maxSkillLength = 20,
  placeholder = "Type a skill and press Enter",
}: SkillInputProps) {
  const [query, setQuery] = useState("");

  const selectedSkills = value ?? [];
  const normalizedQuery = normalizeSkill(query);
  const comparableSelectedSkills = selectedSkills.map(toComparableSkill);
  const skillLimitReached = selectedSkills.length >= maxSkills;

  const filteredSuggestions = useMemo(() => {
    const comparableQuery = normalizedQuery.toLowerCase();

    return suggestions
      .map(normalizeSkill)
      .filter(Boolean)
      .filter((skill, index, array) => {
        return (
          array.findIndex(
            (item) => item.toLowerCase() === skill.toLowerCase(),
          ) === index
        );
      })
      .filter(
        (skill) => !comparableSelectedSkills.includes(skill.toLowerCase()),
      )
      .filter((skill) => {
        if (!comparableQuery) {
          return true;
        }

        return skill.toLowerCase().includes(comparableQuery);
      })
      .slice(0, 12);
  }, [comparableSelectedSkills, normalizedQuery, suggestions]);

  const addSkill = (rawValue: string) => {
    const nextSkill = normalizeSkill(rawValue);

    if (!nextSkill || disabled || skillLimitReached) {
      return;
    }

    if (nextSkill.length > maxSkillLength) {
      return;
    }

    if (comparableSelectedSkills.includes(nextSkill.toLowerCase())) {
      setQuery("");
      return;
    }

    onChange?.([...selectedSkills, nextSkill]);
    setQuery("");
  };

  const removeSkill = (skillToRemove: string) => {
    const comparableSkillToRemove = toComparableSkill(skillToRemove);

    onChange?.(
      selectedSkills.filter(
        (skill) => toComparableSkill(skill) !== comparableSkillToRemove,
      ),
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-input bg-transparent px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="gap-1 rounded-full px-2.5 py-1 text-xs"
            >
              <span>{skill}</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground disabled:pointer-events-none"
                onClick={() => removeSkill(skill)}
                disabled={disabled}
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSkill(query);
              }

              if (
                event.key === "Backspace" &&
                !query &&
                selectedSkills.length > 0 &&
                !disabled
              ) {
                removeSkill(selectedSkills[selectedSkills.length - 1]);
              }
            }}
            placeholder={
              skillLimitReached ? "Skill limit reached" : placeholder
            }
            disabled={disabled || skillLimitReached}
            maxLength={maxSkillLength}
            className="h-8 min-w-[180px] flex-1 border-0 px-0 py-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              disabled={disabled || skillLimitReached}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-1 text-xs transition hover:bg-accent"
              >
                {skill}
              </Badge>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>
          Suggestions are filtered locally. Press Enter to add exactly what you
          typed.
        </span>
        <span>
          {selectedSkills.length}/{maxSkills}
        </span>
      </div>
    </div>
  );
}
