import { useState } from "react";
import { useSelector } from "react-redux";
import { CheckIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { BalanceCard } from "./partials/BalanceCard"
import { DebitCard } from "./partials/DebitCard"
import { LastTransactionsTable } from "./partials/LastTransactionsTable"

/** El apodo es la dirección a la que le llega el dinero: se copia de un toque. */
const HandleBar = ({ username }) => {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(`@${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!username) return null

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="eyebrow shrink-0">Te pagan a</span>
        <span className="figure truncate text-sm font-medium text-ink">@{username}</span>
      </div>
      <button
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-muted
          transition-colors hover:bg-sunken hover:text-ink"
      >
        {copied
          ? <><CheckIcon className="size-3.5 text-entrada" /> Copiado</>
          : <><Square2StackIcon className="size-3.5" /> Copiar</>}
      </button>
    </div>
  )
}

export const HomePage = () => {
  const account = useSelector((state) => state.account);

  return (
    <div className="flex flex-col gap-6">
      <HandleBar username={account.username} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <BalanceCard balances={account.balances ?? {}} />
        <DebitCard pending={account.pending ?? {}} />
      </div>

      <LastTransactionsTable />
    </div>
  )
}
