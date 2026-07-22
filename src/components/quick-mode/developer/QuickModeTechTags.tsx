import React from "react";
import { FiCpu } from "react-icons/fi";

interface QuickModeTechTagsProps {
  tags: string[];
}

export const QuickModeTechTags: React.FC<QuickModeTechTagsProps> = ({ tags }) => (
  <div className="quick-tags" aria-label="Technologies et expertises">
    {tags.map((tag) => (
      <span key={tag}>
        <FiCpu aria-hidden="true" />
        {tag}
      </span>
    ))}
  </div>
);
