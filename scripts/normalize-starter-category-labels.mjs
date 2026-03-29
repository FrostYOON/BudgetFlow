import {
  PrismaClient,
  CategoryType,
} from "../packages/database/generated/client/index.js";

const prisma = new PrismaClient();

const CATEGORY_LABEL_MAP = [
  { from: ["Salary", "월급"], to: "Salary", type: CategoryType.INCOME },
  { from: ["Bonus", "보너스"], to: "Bonus", type: CategoryType.INCOME },
  {
    from: ["Side Income", "부수입"],
    to: "Side Income",
    type: CategoryType.INCOME,
  },
  {
    from: ["Gift", "용돈", "Allowance"],
    to: "Allowance",
    type: CategoryType.INCOME,
  },
  { from: ["Refund", "환급"], to: "Refund", type: CategoryType.INCOME },
  {
    from: ["Groceries", "장보기", "Market"],
    to: "Market",
    type: CategoryType.EXPENSE,
  },
  {
    from: ["Dining Out", "외식", "Eating Out"],
    to: "Eating Out",
    type: CategoryType.EXPENSE,
  },
  { from: ["Housing", "주거"], to: "Housing", type: CategoryType.EXPENSE },
  { from: ["Utilities", "공과금", "Bills"], to: "Bills", type: CategoryType.EXPENSE },
  {
    from: ["Transportation", "교통", "Transport"],
    to: "Transport",
    type: CategoryType.EXPENSE,
  },
  { from: ["Shopping", "쇼핑"], to: "Shopping", type: CategoryType.EXPENSE },
  {
    from: ["Health", "의료", "Healthcare"],
    to: "Healthcare",
    type: CategoryType.EXPENSE,
  },
  {
    from: ["Entertainment", "여가", "Leisure"],
    to: "Leisure",
    type: CategoryType.EXPENSE,
  },
  {
    from: ["Subscriptions", "구독"],
    to: "Subscriptions",
    type: CategoryType.EXPENSE,
  },
  { from: ["Travel", "여행"], to: "Travel", type: CategoryType.EXPENSE },
];

async function main() {
  const defaultCategories = await prisma.category.findMany({
    where: {
      isDefault: true,
      name: {
        in: CATEGORY_LABEL_MAP.flatMap((item) => item.from),
      },
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      type: true,
    },
  });

  let renamedCount = 0;
  const skipped = [];

  for (const category of defaultCategories) {
    const mapping = CATEGORY_LABEL_MAP.find(
      (item) => item.from.includes(category.name) && item.type === category.type,
    );

    if (!mapping) {
      continue;
    }

    const collision = await prisma.category.findFirst({
      where: {
        workspaceId: category.workspaceId,
        type: category.type,
        name: mapping.to,
        NOT: {
          id: category.id,
        },
      },
      select: { id: true },
    });

    if (collision) {
      skipped.push({
        workspaceId: category.workspaceId,
        from: category.name,
        to: mapping.to,
      });
      continue;
    }

    await prisma.category.update({
      where: { id: category.id },
      data: { name: mapping.to },
    });

    renamedCount += 1;
  }

  console.log(
    JSON.stringify(
      {
        renamedCount,
        skipped,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
