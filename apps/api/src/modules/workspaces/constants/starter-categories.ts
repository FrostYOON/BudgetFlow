import { CategoryType } from '@budgetflow/database';

type StarterCategoryDefinition = {
  name: string;
  type: CategoryType;
};

const STARTER_CATEGORIES: StarterCategoryDefinition[] = [
  { name: 'Salary', type: CategoryType.INCOME },
  { name: 'Bonus', type: CategoryType.INCOME },
  { name: 'Side Income', type: CategoryType.INCOME },
  { name: 'Gift', type: CategoryType.INCOME },
  { name: 'Refund', type: CategoryType.INCOME },
  { name: 'Groceries', type: CategoryType.EXPENSE },
  { name: 'Dining Out', type: CategoryType.EXPENSE },
  { name: 'Housing', type: CategoryType.EXPENSE },
  { name: 'Utilities', type: CategoryType.EXPENSE },
  { name: 'Transportation', type: CategoryType.EXPENSE },
  { name: 'Shopping', type: CategoryType.EXPENSE },
  { name: 'Health', type: CategoryType.EXPENSE },
  { name: 'Entertainment', type: CategoryType.EXPENSE },
  { name: 'Subscriptions', type: CategoryType.EXPENSE },
  { name: 'Travel', type: CategoryType.EXPENSE },
];

export function buildStarterCategories(workspaceId: string) {
  return STARTER_CATEGORIES.map((category, index) => ({
    workspaceId,
    name: category.name,
    type: category.type,
    sortOrder: index,
    isDefault: true,
  }));
}
