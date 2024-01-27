import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vROeMM8oMlZ6rGkQMRCL4bWiVYDfxxo9QYOPca9WZTUF_idwTQ0gMTScgoTa1HOUnPT6USpJ1DU7hyK/pub?gid=0&single=true&output=csv';

function App() {
  const [dataHistory, setDataHistory] = useState<string[][][]>([]);
  const [lastDataUpdate, setLastDataUpdate] = useState<string>('');

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await axios.get(csvUrl);
        const newData = parseCSV(response.data);

        if (!isDataInHistory(newData, dataHistory)) {
          setDataHistory(prevHistory => [...prevHistory, newData]);
          setLastDataUpdate(new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCSVData();
    const intervalId = setInterval(fetchCSVData, 10000); // Fetch every 10 seconds

    return () => clearInterval(intervalId);
  }, [dataHistory]); // Dependency on dataHistory and isDataInHistory

  const parseCSV = (csvText: string): string[][] => {
    const rows = csvText.split(/\r?\n/);
    return rows.slice(1).map(row => row.split(','));
  };

  const isDataInHistory = (data: string[][], history: string[][][]) => {
    return history.some(historicalData => isDataEqual(data, historicalData));
  };

  const isDataEqual = (data1: string[][], data2: string[][]) => {
    return JSON.stringify(data1) === JSON.stringify(data2);
  };

  const getLastUniqueData = () => {
    return dataHistory[dataHistory.length - 1] || [];
  };

  console.log('dataHistory:', dataHistory);

  const lastUniqueData = getLastUniqueData();
  console.log('lastUniqueData:', lastUniqueData);

  return (
    <div className="App">
      <div className={"text hour-state"}>{lastDataUpdate || 'No update yet'}</div>
      <div className={"text text-left-column staff"}>{lastUniqueData[2]?.[1] || ''}</div>
      <div className={"text text-left-column city"}>{lastUniqueData[1]?.[1] || ''}</div>
      <div className={"text text-left-column country"}>{lastUniqueData[0]?.[1] || ''}</div>

      <div className="sponsors">
      <img loading="lazy" src={require('./assets/sponsors-logos.gif')} alt="Sponsorzy" className="sponsors-logos" />
      </div>
    </div>
  );
}

export default App;
