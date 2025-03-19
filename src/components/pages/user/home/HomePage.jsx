import { BalanceCard } from "./partials/BalanceCard"
import { DebitCard } from "./partials/DebitCard"
import { TransactionsTable } from "./partials/TransactionsTable"

export const HomePage = () => {
  return (
    <div className="flex flex-col gap-6 px-4 lg:p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard balance={1000} />
        <DebitCard balance={1100} />
      </div>
      <TransactionsTable />
    </div>
  )
}
