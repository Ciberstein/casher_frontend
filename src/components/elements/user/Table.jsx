import React, { useEffect, useState } from 'react';
import Pagination from '@mui/lab/Pagination';
import cutString from '../../../utils/cutString';
import { ChevronDoubleDownIcon, ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Input } from './Input';
import { SearchOffOutlined } from '@mui/icons-material';
import convertDate from '../../../utils/convertDate';

const variants = {
  sm: { className: 'text-sm p-1', size: 'small' },
  md: { className: 'text-md p-2', size: '' },
  lg: { className: 'text-lg p-3', size: 'large' },
  xl: { className: 'text-xl p-4', size: 'large' },
};


const getFieldVal = (field, array1, array2) => {
  const item = array1.find(i => i.field === field);

  if (!item) {
    return undefined;
  }

  const itemParts = field.split('.');
  return itemParts.reduce((result, part) => (
    result && Object.prototype.hasOwnProperty.call(result, part) ? result[part] : undefined
  ), array2);
};

const actionParams = (object, params) => {
  const props = {};

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (value.startsWith('%') && value.endsWith('%')) {
        const paramName = value.slice(1, -1); // Elimina los '%' al inicio y al final
        props[key] = Object.prototype.hasOwnProperty.call(object, paramName) ? object[paramName] : paramName;
      } else {
        props[key] = value;
      }
    } else {
      props[key] = value;
    }
  });

  return props;
};

export const Table = ({
  element = null, // Component required!
  header = [],
  items = [],
  className = '',
  size = 'md',
  title = null,
  check = null,
  dropdown = {
    header: '',
    params: {},
    component: null,
  },
  actions = {
    header: '',
    params: {},
    component: null,
  },
  pagination = {
    count: null,
    page: null,
    total: null,
    trigger: null,
  },
}) => {
  const [select, setSelect] = useState([]);
	const [searchText, setSearchText] = useState(''); 
	const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1);
  const [cols, setCols] = useState(header.length);

	const { t } = useTranslation();

  const getCols = () => {
    let totalCols = cols;

    if (actions.component) {
      totalCols += 1;
    }
    if (dropdown.component) {
      totalCols += 1;
    }
    if (check) {
      totalCols += 1;
    }

    setCols(totalCols);
  };

  const handleSelect = (value) => {
    if (select.includes(value)) {
      setSelect(select.filter(item => item !== value));
    } else {
      setSelect([...select, value]);
    }
  };

  const filteredItems = items?.filter(item => Object.values(item || {}).some(value => {
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(subValue => {
        if (typeof subValue === 'string' && subValue !== null) {
          return subValue.toString().toLowerCase().includes(searchText.toLowerCase());
        }
        return false;
      });
    }
    if (value !== null) {
      return value.toString().toLowerCase().includes(searchText.toLowerCase());
    }
    return false;
  }));

  const renderCellContent = (tr, th) => {
    if (th.img) {
      const imgSrc = th.img.replace('%FIELD%', tr[th.field]);
      return (
        <div className="flex items-center justify-center">
          <img
            src={imgSrc}
            alt={imgSrc}
            className="max-w-[30px] hover:scale-125 transition-all duration-200 ease-in-out"
          />
        </div>
      );
    }
    if (th.wordWrap) {
      return cutString(getFieldVal(th.field, header, tr), th.wordWrap);
    }
    if (th.date) {
      return convertDate(tr[th.field]);
    }
    if (th.function) {
      return th.function.func(getFieldVal(th.field, header, tr));
    }

    return getFieldVal(th.field, header, tr);
  };

  const [totalItems, setTotalItems] = useState(filteredItems.length);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalItems / itemsPerPage));

  const [drop, setDrop] = useState(null);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const onRowsChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1);
  };

  const cleanSearch = (e) => {
    setSearchText("")
  };

  const onPageChange = (e, page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setTotalItems(filteredItems.length);
  }, [filteredItems]);

  useEffect(() => {
    setTotalPages(Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  useEffect(() => {
    getCols();
  }, []);

  useEffect(() => {
    setDrop(null);
  }, [items, currentPage]);

  return (
    <div className={`!p-0 overflow-auto rounded-xl dark:bg-zinc-900
      bg-slate-50 h-full flex flex-col justify-between ${className}`}
    >
      <table className={`w-full ${currentItems.length === 0 && 'h-full'}`}>
        <thead className="">
          { element &&
						<tr>
							<th colSpan={cols}>
							<div className="px-4 pt-4">
								{React.cloneElement(element, { selectedElements: select, setSelectedElements: setSelect })}
							</div>
							</th>
						</tr>
          }
					<tr>
						<th colSpan={cols}>
							<div className={`flex flex-wrap min-w-max ${title ? 'justify-between' : 'justify-end'} items-center font-normal gap-4 p-4`}>
								{ title && <h3 className="font-semibold text-lg">{title}</h3> }
								<Input
									icon={<MagnifyingGlassIcon className="size-5" />}
									id="searchInput"
									name="searchInput"
									placeholder={t("Search")}
									className="!rounded-full px-3"
									size={size}
									value={searchText}
									onChange={handleSearchChange}
									element={
										<button onClick={cleanSearch}>
											<XMarkIcon className="size-4" />
										</button>
									}
								/>
							</div>
						</th>
					</tr>
          <tr className="bg-gray-200 dark:bg-zinc-950">
            { check && (<th aria-label="check" />) }
            { header.map((th) => (
              <th className={`${variants[size].className} ${th.hidden && 'hidden'} p-4`} key={th.name}>
                {th.name}
              </th>
            )) }
            { actions.component && <th className={`${variants[size].className} p-4`}>{actions.header}</th> }
            { dropdown.component && <th className={`${variants[size].className} p-4`}>{dropdown.header}</th> }
          </tr>
        </thead>
        <tbody className="bg-admin-light-600/50 dark:bg-admin-dark-600/50">
          { currentItems.length > 0
            ? currentItems.map((tr, index) => (
              <>
                <tr className={`border-b ${variants[size].className}`}>
                  { check && (
                    <td>
                      <div className="flex items-center justify-center px-4 py-2">
                        <button onClick={() => handleSelect(getFieldVal(check, header, tr))}>
                          { select.includes(getFieldVal(check, header, tr))
                            ? <></>
                            : <></> }
                        </button>
                      </div>
                    </td>)}
                  { header.map(th => (
                    <td className={`px-4 py-2 ${th.hidden && 'hidden'}`} key={th.field} colSpan={th.colSpan || 1}>
                      { renderCellContent(tr, th) }
                    </td>
                  )) }
                  { actions.component && (
                    <td aria-label="component">
                      {React.cloneElement(actions.component, actionParams(tr, actions?.params))}
                    </td>)}
                  { dropdown.component && (
                    <td>
                      <div className="flex justify-center">
                        { drop !== null && index === drop ? (
                          <button
                            aria-label="dropdown-btn"
                            onClick={() => setDrop(null)}
                            className="!rounded-full hover:bg-gray-100"
                          >
                            <ChevronUpIcon className="text-gray-500 size-7" />
                          </button>)
                          : (
                            <button
                              aria-label="dropdown-btn"
                              onClick={() => setDrop(index)}
                              className="!rounded-full hover:bg-gray-100"
                            >
                              <ChevronDoubleDownIcon className="text-gray-500 size-7" />
                            </button>)}
                      </div>
                    </td>)}
                </tr>
                {
                  dropdown.component && drop === index ? (
                    <tr className="border-b dark:border-admin-dark-700">
                      <td colSpan={cols} className="p-0">
                        {React.cloneElement(dropdown.component, actionParams(tr, dropdown?.params))}
                      </td>
                    </tr>) : null
                }
              </>
            )) : (
              <tr>
                <td colSpan={cols + 1} aria-label="no-results">
                  <div className="flex flex-col flex-grow justify-center items-center gap-2 p-10 text-xl font-medium">
                    <SearchOffOutlined />
										<h1>{t("No results found")}</h1>
                  </div>
                </td>
              </tr>)}
        </tbody>
      </table>
      <div className={`flex flex-wrap gap-4 justify-between items-center p-4 ${variants[size].className}`}>
        <span className="font-normal">Total: {pagination.total || totalItems}</span>
        <div className="flex flex-wrap gap-4 text-black">
          <label htmlFor="tableRows" className="flex gap-4 items-center rounded-full p-1 px-3
						bg-gray-200 font-normal"
          >
						Filas:
						<select
							id="tableRows"
							className="bg-transparent border-0 focus-visible:outline-none"
							onChange={(e) => onRowsChange(e)}>
							<option defaultValue={15} selected>15</option>
							<option defaultValue={25}>25</option>
							<option defaultValue={30}>30</option>
							<option defaultValue={50}>50</option>
						</select>
          </label>
          <div className="p-1 rounded-full bg-gray-200">
            <Pagination
              count={pagination.count || totalPages}
              page={pagination.page || currentPage}
              onChange={pagination.trigger || onPageChange}
              size={variants[size].size}
              showFirstButton
              showLastButton
            />
          </div>
        </div>
      </div>
    </div>
  );
};
