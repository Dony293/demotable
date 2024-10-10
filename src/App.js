import React, { useState, useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';


import { GraphQLClient, gql } from 'graphql-request';
const client = new GraphQLClient('http://localhost:3001/graphql', {
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YWExMzBmOWFmMzFiNGYwMzc1ZTk3NSIsImlhdCI6MTcyNzA3NDkwOSwiZXhwIjoxNzI3MTYxMzA5fQ.8LyvDoDc8TV5Bdv7yQmqnA7mA68_S8Ruihf043t28OQ`,  // Token de autenticación
  },
});

// Registrar todos los módulos de Handsontable
registerAllModules();
const LOAD_DATA_QUERY_AUX = gql`
  query Query($prospectsId: IdProspectListInput!) {
  prospects(id: $prospectsId)
}
`;
const LOAD_DATA_QUERY = gql`
  query ProspectsLists($prospectListId: IdArgs!) {
    prospectList(id: $prospectListId) {
    fields
    rows
  }
}
`;

const hotData = [
  ["", "Tesla", "Volvo", "Toyota", "Honda"],
  ["Jorge", "adsfasd"],
  ["Octavio", "sadf", "asdf", "dfd"],
  ["2022", 30, 15, 12, 13],
  ["2020", 10, 11, 12, 13],
  ["2021", 20, 11, 14, 13],
  ["2022", 30, 15, 12, 13],
  [12],
  // [null, null, null, null, null, null]
];
const SAVE_DATA_MUTATION = gql`
  mutation UpdateRowData($updateRowData: UpdateDataRowInput!) {
  updateRowData(updateRowData: $updateRowData) {
    message
    code
  }
}
`;

const CREATE_COLUMN = gql`
  mutation CreateColumnProspectList($createColumnInput: CreateColumnInput!) {
  createColumnProspectList(createColumnInput: $createColumnInput) {
    fields
  }
}
`;
const ExampleComponent = () => {
  const hotTableRef = useRef(null);
  const [output, setOutput] = useState('Click "Load" to load data from server');
  const [isAutosave, setIsAutosave] = useState(false);
  // Ejemplo de headers iniciales
  // const [columns, setColumns] = useState([
  //   { name: 'Nombre del lead', type: 'lead_name', key: true },
  //   { name: 'Email', type: 'email', key: true },
  // ]);

  const [columns, setColumns] = useState([
  ]);

  // Datos de la tabla
  const [tableData, setTableData] = useState([]);

  // Cargar datos al montar el componente
  // useEffect(() => {
  //   loadTableData();
  // }, []);

  // Manejar el evento de cambio
  const afterColumnInsert = async (index, amount) => {
    const newHeader = { name: 'Nueva Columna', type: `custom_${index}`, key: false };

    // Agregar el nuevo header a la lista de columnas
    const updatedColumns = [...columns];
    updatedColumns.splice(index, 0, newHeader);

    // const response = 

    setColumns(updatedColumns);
    // Enviar el nuevo header al servidor
    saveNewHeaderToServer(newHeader,index);
  };

  // Función para guardar el nuevo header en el servidor
  const saveNewHeaderToServer = async (header,index) => {

    const variables = {
      "createColumnInput": {
        "idProspectList": "66d5c94fd93cb34c77b402bf",
        "index": index,
        "name": "Nueva columna"
      }
    };
    await client.request(CREATE_COLUMN, variables)
      .then(response => response.json())
      .then(data => {
        console.log('Header guardado:', data);
      })
      .catch(error => {
        console.error('Error al guardar el header:', error);
      });
  };

  // Cargar los datos de la tabla desde el servidor
  const loadTableData = async () => {
    // fetch('/api/load-table-data', {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then(response => response.json())
    //   .then(data => {
    //     setTableData(data); // Actualizar los datos de la tabla
    //     const hot = hotTableRef.current.hotInstance;
    //     hot.loadData(data); // Cargar los datos en Handsontable
    //   })
    //   .catch(error => {
    //     console.error('Error al cargar los datos de la tabla:', error);
    //   });
    try {
      const variables = {
        "prospectListId": {
          "id": "66d5c94fd93cb34c77b402bf"
        }
      };

      const response = await client.request(LOAD_DATA_QUERY, variables);
      console.log(response.prospectList.fields);
      console.log(response.prospectList.rows.rowData);
      // const { rows } = response.tableData;
      // const rows = response.fields;
      // hotRef.current.loadData(rows);
      // setTableData(rows);
      const columnas = response.prospectList.fields;
      const rows = response.prospectList.rows.rowData;
      // hot
      setColumns(columnas);
      const hot = hotTableRef.current.hotInstance;
      hot.loadData(rows);
      setTableData(rows);
      // hot.loadData(hotData);
      // setTableData(hotData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Guardar los datos de la tabla en el servidor
  const saveTableData = async () => {
    try {
      const hot = hotTableRef.current.hotInstance;
      const currentData = hot.getData();
      console.log(currentData);
      const variables = {
        "updateRowData": {
          "data": {
            "rowData": currentData
          },
          "idProspectList": "66d5c94fd93cb34c77b402bf"
        }
      };
      console.log(variables);
      const response = await client.request(SAVE_DATA_MUTATION, variables);
      console.log(response);

    } catch (error) {
      console.error('Error loading data:', error);
    };



    // const hot = hotTableRef.current.hotInstance;
    // const currentData = hot.getData(); // Obtener los datos actuales de la tabla

    // fetch('/api/save-table-data', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ data: currentData }),
    // })
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('Datos guardados:', data);
    //   })
    //   .catch(error => {
    //     console.error('Error al guardar los datos de la tabla:', error);
    //   });
  };
  const autosaveClickCallback = (event) => {
    const target = event.target;

    setIsAutosave(target.checked);

    if (target.checked) {
      setOutput('Changes will be autosaved');
    } else {
      setOutput('Changes will not be autosaved');
    }
  };
  return (
    <>
      <HotTable
        ref={hotTableRef}
        data={tableData}
        colHeaders={columns.map(col => col.name)} // Mostrar nombres de columnas
        contextMenu={true} // Habilitar el menú contextual
        afterCreateCol={afterColumnInsert} // Evento para detectar la creación de columnas
        autoWrapRow={true}
        autoWrapCol={true}
        height="auto"
        width="auto"
        licenseKey="non-commercial-and-evaluation"
        afterChange={(change, source) => {
          if (!change) {
            return;
          }

          if (!isAutosave) {
            return;
          }
          console.log("Change: " + JSON.stringify(change));
        }}
      />
      <div className="controls">
        <button onClick={loadTableData}>Cargar datos</button>
        <button onClick={saveTableData}>Guardar datos</button>
        <label>
          <input
            type="checkbox"
            name="autosave"
            id="autosave"
            checked={isAutosave}
            onClick={autosaveClickCallback}
          />
          Autosave
        </label>
      </div>
    </>
  );
};

export default ExampleComponent;