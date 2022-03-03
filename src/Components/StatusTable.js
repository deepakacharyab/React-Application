import React, { useEffect, useState } from 'react'
import { useTable, usePagination, useRowSelect } from 'react-table'
import {useLocalStorage, writeStorage } from '@rehooks/local-storage';


const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef
  
      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])
  
      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
      )
    }
  )
  

var StatusTable = function({ columns, data, page2 }) {
    // Use the state and functions returned from useTable to build your UI
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      prepareRow,
      page, // Instead of using 'rows', we'll use page,
      // which has only the rows for the active page
  
      // The rest of these things are super handy, too ;)
      canPreviousPage,
      canNextPage,
      pageOptions,
      pageCount,
      gotoPage,
      nextPage,
      previousPage,
      
      setPageSize,
      selectedFlatRows,
      state: { pageIndex, pageSize, selectedRowIds },
    } = useTable(
      {
        columns,
        data,
        initialState: { pageIndex: !parseInt(page2)?0:parseInt(page2), selectedRowIds:localStorage.getItem("delSet") != 1  && localStorage.getItem("statusTab")  != 1? JSON.parse(localStorage.getItem("delIds")):{}}, 
        usePagination
      },
      usePagination,
      useRowSelect,
      hooks => {
        hooks.visibleColumns.push(columns => [
          // Let's make a column for selection
          {
            id: 'selection',
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllPageRowsSelectedProps }) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
              </div>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            ),
          },
          ...columns,
        ])
      }
    )
    const [refresh, setRefresh] = useLocalStorage("refresh");

    writeStorage("pageIndexCheck", pageIndex);
   
   /* function refreshPage() {
      window.location.reload(false);
    }
    */

    let selectedId = (ids) => {
      writeStorage("delSet", 1);
      const org = ids.map(
        d => d.original.request_id
      )     
      
      let lIds = JSON.parse(localStorage.getItem("ids")).filter(val => !org.includes(val));
      writeStorage("ids", JSON.stringify(lIds));
      //writeStorage("delIds", {});
      writeStorage("statusFetch", []);
      //refreshPage();
      setRefresh(1);
    };

    writeStorage("delIds", JSON.stringify(selectedRowIds));
    writeStorage("statusTab", 0);

    //setPageIndex(pageIndex)
    // Render the react table
    return ( 
      <>
        <pre>
        </pre>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        {/* 
          Pagination can be built however you'd like. 
          This is just a very basic UI implementation:
        */}
        
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>{' '}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>{' '}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>{' '}
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {'>>'}
          </button>{' '}
          <span>
            Page{' '}
            <strong>
              {parseInt(pageIndex) + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <span>
            | Go to page:{' '}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                gotoPage(page)
              }}
              style={{ width: '100px' }}
            />
          </span>{' '}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50, 60].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          
        </div>
        <div className="deleteTxt">
            Please select the rows above and click on delete
            <div className="delete">
            <button onClick={ (e) => selectedId(selectedFlatRows)} className="button button5" disabled={selectedFlatRows.length === 0}>
              DELETE ROWS
            </button>      
            </div>
          </div>
      </>
    )
  };

  export default StatusTable;