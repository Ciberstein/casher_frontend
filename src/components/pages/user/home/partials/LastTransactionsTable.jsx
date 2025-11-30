import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react';
import { transactionsThunk } from '../../../../../store/slices/transactions.slice';
import { Link } from 'react-router-dom';
import { SearchOffOutlined } from '@mui/icons-material';
import convertDate from '../../../../../utils/convertDate';
import { ArrowTurnDownLeftIcon, ArrowTurnUpRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import currencyFormat from '../../../../../utils/currency';
import ManageTxModal from '../../transactions/partials/ManageTxModal';

export const IconTx = ({ tx }) => {

	const account = useSelector(state => state.account);

	if(tx.data.type === 10) {
		if(account.id === tx.owner.id) {
			return (
				<div className="rounded-full bg-red-300 p-1 border text-black dark:border-black">
					<ArrowTurnUpRightIcon className="size-3" />
				</div>
			);			
		}

		if(account.id === tx.receiver.id) {
			return (
				<div className="rounded-full bg-green-300 p-1 border text-black dark:border-black">
					<ArrowTurnDownLeftIcon className="size-3" />
				</div>
			);
		}
	}
}

export const LastTransactionsTable = () => {

	const dispatch = useDispatch();
	const transactions = useSelector(state => state.transactions);
	const account = useSelector(state => state.account);
	const [selected, setSelected] = useState(null);
	const [txModal, setTxModal] = useState(false);

	const handleTxDetails = (tx) => {
		setSelected(tx)
		setTxModal(true);
	};
	
	useEffect(() => {
		dispatch(transactionsThunk());
	}, []);

	return (
		<div className="!p-0 overflow-auto rounded-2xl dark:bg-zinc-900 bg-slate-50 h-full flex flex-col justify-between">
			<ManageTxModal open={txModal} setOpen={setTxModal} tx={selected} />
			<table>
				<thead>
					<tr>
						<th colSpan="6">
							<div className="p-4 flex justify-start">
								<h3 className="font-semibold text-lg">Transacciones recientes</h3> 
							</div>
						</th>
					</tr>
					<tr className="bg-gray-200 dark:bg-zinc-950">
						<th className="p-4 font-semibold">Serial</th>
						<th className="p-4 font-semibold">Estátus</th>
						<th className="p-4 font-semibold">Importe</th>
						<th className="p-4 font-semibold">Fecha</th>
						<th className="p-4 font-semibold"></th>
					</tr>
				</thead>
				<tbody className="font-medium">
					{
						transactions.length > 0 ?
							transactions.slice(0, 5).map((transaction, index) => (
								<tr
									onClick={() => handleTxDetails(transaction)} key={index}
									className={`border-b text-md p-2 dark:border-black/20
										hover:dark:bg-zinc-800 hover:bg-white  cursor-pointer`
									}
								>
									<td>
										<div className="flex items-center justify-center px-4 py-2">
											{transaction.hash}
										</div>
									</td>
									<td>
										<div className="flex items-center justify-center w-full">
											<div className={`px-4 rounded-full text-center w-full
												${transaction.status === 'completed' && 'bg-green-300'}
												${transaction.status === 'pending' && 'bg-yellow-300'}
												${transaction.status === 'cancelled' && 'bg-red-300'}
											`}>
												<span className="uppercase italic text-black">
													{transaction.status}
												</span>
											</div>
										</div>
									</td>
									<td>
										<div className="flex items-center justify-center px-4 py-2">
											<span className={`font-medium ${transaction.owner.id === account.id ?
												'text-red-400' : 'text-green-400'}`}
											>
												{transaction.owner.id === account.id ? '-' : '+'}
												{currencyFormat(transaction.data.amount)}
											</span>
										</div>
									</td>
									<td>
										<div className="flex items-center justify-center px-4 py-2 text-nowrap">
											{convertDate(transaction.createdAt)}
										</div>
									</td>
									<td>
										<div className="flex items-center justify-center px-4 py-2">
											<div className="relative font-medium size-11">
												<div className="absolute top-0 left-0">
													<div className="size-10 rounded-full border-[2px] border-gray-300 dark:border-black flex flex-col justify-center items-center bg-slate-200">
														<span className="text-lg text-zinc-500 uppercase">
															{transaction.owner.data?.first_name.split("")[0]}
															{transaction.owner.data?.surname_1.split("")[0]}
														</span>
													</div>					
												</div>
												<div className="absolute bottom-0 right-0">
													{<IconTx tx={transaction} />}
												</div>
											</div>
										</div>
									</td>
								</tr>
							))
						:
						<tr>
							<td colSpan="6" aria-label="no-results">
								<div className="flex flex-col flex-grow justify-center items-center gap-2 p-10 text-xl font-medium">
									<SearchOffOutlined />
									<h1>{"No results found"}</h1>
								</div>
							</td>
						</tr>
					}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan="6">
							<div className="p-4 flex justify-center">
							{ transactions.length > 5 &&
								<Link to={"/transactions"} className="font-semibold text-lg hover:underline">
									Ver más
								</Link>
							}
							</div>
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
	)
}
