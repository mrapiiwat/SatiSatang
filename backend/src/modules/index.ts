import { Elysia } from "elysia";
import { authController } from "./auth/auth.controller";
import { budgetController } from "./budget/budget.controller";
import { categoryController } from "./category/category.controller";
import { chatController } from "./chat/chat.controller";
import { consentController } from "./consent/consent.controller";
import { goalController } from "./goal/goal.controller";
import { iconController } from "./icon/icon.controller";
import { notificationController } from "./notification/notification.controller";
import { notificationCrons } from "./notification/notification.crons";
import { settingController } from "./setting/setting.controller";
import { stockController } from "./stock/stock.controller";
import { transactionController } from "./transaction/transaction.controller";
import { userController } from "./user/user.controller";

const modules = new Elysia({ prefix: "/api" })
  .use(authController)
  .use(userController)
  .use(iconController)
  .use(goalController)
  .use(categoryController)
  .use(budgetController)
  .use(transactionController)
  .use(chatController)
  .use(consentController)
  .use(settingController)
  .use(notificationController)
  .use(notificationCrons)
  .use(stockController);

export default modules;
