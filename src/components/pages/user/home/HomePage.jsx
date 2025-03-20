import { useSelector } from "react-redux";
import { BalanceCard } from "./partials/BalanceCard"
import { DebitCard } from "./partials/DebitCard"
import { TransactionsTable } from "./partials/TransactionsTable"

export const HomePage = () => {

  const account = useSelector((state) => state.account);

  return (
    <div className="flex flex-col gap-6 px-4 lg:p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard balance={account.balance_available} />
        <DebitCard balance={account.balance_pending} />
      </div>
      <TransactionsTable />
    </div>
  )
}
