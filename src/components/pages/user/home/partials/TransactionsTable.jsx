import { Table } from '../../../../elements/user/Table'

export const TransactionsTable = () => {

	const header = [
		{
			field: 'id',
			name: 'ID',
		},
		{
			field: 'createdAt',
			name: 'Fecha',
			date: true
		},
	]

  return (
		<Table
			header={header} 
			items={[]}
			title={"Transacciones recientes"}
		/>
  )
}
