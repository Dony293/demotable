import React, { useEffect, useRef, useState } from 'react';
import Handsontable from 'handsontable';
import { GraphQLClient, gql } from 'graphql-request';
import 'handsontable/dist/handsontable.full.min.css';
const client = new GraphQLClient('http://localhost:3001/graphql',{
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YWExMzBmOWFmMzFiNGYwMzc1ZTk3NSIsImlhdCI6MTcyNjc1NTI3NywiZXhwIjoxNzI2ODQxNjc3fQ.9drh9j05QtvM6k_JSbB7aJvT9irnN_zDQe_ufHA_Hyc`,  // Token de autenticación
  },
});

const LOAD_DATA_QUERY = gql`
  query Query($prospectsId: IdProspectListInput!) {
  prospects(id: $prospectsId)
}
`;

const hotData = [
  // ["", "Tesla", "Volvo", "Toyota", "Honda"],
  ["2020", 10, 11, 12, 13],
  ["2021", 20, 11, 14, 13],
  ["2022", 30, 15, 12, 13],
  ["2020", 10, 11, 12, 13],
  ["2021", 20, 11, 14, 13],
  ["2022", 30, 15, 12, 13],
  [12],
];
const SAVE_DATA_MUTATION = gql`
  mutation SaveTableData($data: [[String]]) {
    saveTableData(data: $data) {
      success
    }
  }
`;

const TableComponent = () => {
  const hotRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);

  useEffect(() => {
    // Initialize Handsontable
    hotRef.current = new Handsontable(document.getElementById('hot'), {
      data: [[]],
      rowHeaders: true,
      // colHeaders: true,
      colHeaders:
      ["", "Tesla", "Volvo", "Toyota", "Honda"] ,
      licenseKey: 'non-commercial-and-evaluation',
      afterChange: (changes, source) => {
        if (source !== 'loadData' && autosaveEnabled) {
          saveTableData(hotRef.current.getData());
        }
      },
      contextMenu: true,
      minCols:5,
      minRows: 7,
    });

    // Load initial data
    // loadData();

    return () => {
      hotRef.current.destroy(); // Clean up
    };
  }, [autosaveEnabled]);

  const loadData = async () => {
    try {
      const variables = {
        "prospectsId": {
          "prospect_list_id": "66d5c94fd93cb34c77b402bf",  // Valor de prospectsId
        },
      };

      const response = await client.request(LOAD_DATA_QUERY,variables);
      console.log(response.prospects);
      // const { rows } = response.tableData;
      const rows = response.prospects;
      // hotRef.current.loadData(rows);
      // setTableData(rows);
      hotRef.current.loadData(hotData);
      setTableData(hotData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveTableData = async (data) => {
    try {

    // const hotInstance = hotRef.current.hotInstance;
      console.log(data.current.getColHeader()); 
      console.log(data.current.getData());
      
      // const response = await client.request(SAVE_DATA_MUTATION, { data });
      // if (response.saveTableData.success) {
      //   console.log('Data saved successfully');
      // }

    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <div>
      <div id="hot" style={{ width: '600px', height: '400px' }}></div>
      <button onClick={loadData}>Load Data</button>
      <button onClick={() => saveTableData(hotRef)}>Save Data</button>
      <label>
        <input
          type="checkbox"
          checked={autosaveEnabled}
          onChange={(e) => setAutosaveEnabled(e.target.checked)}
        />
        Autosave
      </label>
    </div>
  );
};

export default TableComponent;
