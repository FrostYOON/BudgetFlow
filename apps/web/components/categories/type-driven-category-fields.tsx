"use client";

import { useState } from "react";

type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

function filterCategories(
  categories: CategoryOption[],
  selectedType: "INCOME" | "EXPENSE",
) {
  return categories.filter((category) => category.type === selectedType);
}

export function TypeDrivenCategoryFields({
  categories,
  defaultCategoryId,
  defaultType,
  typeName = "type",
  categoryName = "categoryId",
  containerClassName = "contents",
  selectClassName,
}: {
  categories: CategoryOption[];
  defaultCategoryId?: string | null;
  defaultType: "INCOME" | "EXPENSE";
  typeName?: string;
  categoryName?: string;
  containerClassName?: string;
  selectClassName: string;
}) {
  const [selectedType, setSelectedType] = useState<"INCOME" | "EXPENSE">(
    defaultType,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    defaultCategoryId ?? "",
  );

  const availableCategories = filterCategories(categories, selectedType);
  const displayedCategoryId = availableCategories.some(
    (category) => category.id === selectedCategoryId,
  )
    ? selectedCategoryId
    : "";

  return (
    <div className={containerClassName}>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Type</span>
        <select
          name={typeName}
          value={selectedType}
          onChange={(event) => {
            const nextType = event.target.value as "INCOME" | "EXPENSE";
            const nextCategories = filterCategories(categories, nextType);

            setSelectedType(nextType);

            if (
              selectedCategoryId &&
              !nextCategories.some(
                (category) => category.id === selectedCategoryId,
              )
            ) {
              setSelectedCategoryId("");
            }
          }}
          className={selectClassName}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Category</span>
        <select
          name={categoryName}
          value={displayedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
          className={selectClassName}
        >
          <option value="">No category</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
