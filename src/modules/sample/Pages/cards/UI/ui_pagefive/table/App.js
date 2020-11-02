import React, {useMemo, useState, useEffect} from 'react';
import {Checkbox} from '@material-ui/core';
import axios from 'axios';

import Table from './Table';
import './App.css';

const Genres = ({values}) => {
  return (
    <>
      {values.map((genre, idx) => {
        return (
          <span key={idx} className='badge'>
            {genre}
          </span>
        );
      })}
    </>
  );
};

function App() {
  const [data, setData] = useState([]);
  const columns = useMemo(
    () => [
      {
        Header: 'TV Show',
        columns: [
          {
            Header: 'Name',
            accessor: 'show.name',
          },
          {
            Header: 'Type',
            accessor: 'show.type',
          },
        ],
      },
      {
        Header: 'Details',
        columns: [
          {
            Header: 'Language',
            accessor: 'show.language',
          },
          {
            Header: 'Genre(s)',
            accessor: 'show.genres',
            Cell: ({cell: {value}}) => <Genres values={value} />,
          },
          {
            Header: 'Runtime',
            accessor: 'show.runtime',
            Cell: ({cell: {value}}) => {
              const hour = Math.floor(value / 60);
              const min = Math.floor(value % 60);
              return (
                <>
                  {hour > 0 ? `${hour} hr${hour > 1 ? 's' : ''} ` : ''}
                  {min > 0 ? `${min} min${min > 1 ? 's' : ''}` : ''}
                </>
              );
            },
          },
          {
            Header: 'Status',
            accessor: 'show.status',
          },
          {
            Header: 'Delete',
            id: 'delete',
            accessor: 'show.delete',

            Cell: (tableProps) => (
              <span
                style={{
                  cursor: 'pointer',
                  color: 'black',
                  textDecoration: 'underline',
                }}
                onClick={(index) => {
                  // ES6 Syntax use the rvalue if your data is an array.
                  const dataCopy = [...data];
                  // It should not matter what you name tableProps. It made the most sense to me.
                  //   dataCopy.splice(tableProps.row.index, 5);
                  //   alert("deleted"+tableProps.row.index+"row");
                  //   console.log(tableProps.row.index);
                  dataCopy.filter(
                    (e) => tableProps.row.index !== e.tableProps.row.index,
                  );
                  setData(dataCopy);
                }}>
                Delete
              </span>
            ),
          },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    (async () => {
      const result = await axios('https://api.tvmaze.com/search/shows?q=snow');
      setData(result.data);
    })();
  }, []);

  return (
    <div className='App'>
      <Table columns={columns} data={data} />
    </div>
  );
}

export default App;
