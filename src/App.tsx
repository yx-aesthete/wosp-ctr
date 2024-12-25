import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Confetti from 'react-confetti';
import { gsap } from 'gsap';

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vROeMM8oMlZ6rGkQMRCL4bWiVYDfxxo9QYOPca9WZTUF_idwTQ0gMTScgoTa1HOUnPT6USpJ1DU7hyK/pub?gid=0&single=true&output=csv';

function App() {
  const [dataHistory, setDataHistory] = useState<string[][][]>([]);
  const [lastDataUpdate, setLastDataUpdate] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLDivElement | null>(null);
  const staffRef = useRef<HTMLDivElement | null>(null);
  const cityRef = useRef<HTMLDivElement | null>(null);
  const countryRef = useRef<HTMLDivElement | null>(null);

  const [prevStaff, setPrevStaff] = useState<string>('');
  const [prevCity, setPrevCity] = useState<string>('');
  const [prevCountry, setPrevCountry] = useState<string>('');

  const isDataEqual = useCallback((data1: string[][], data2: string[][]) => {
    return JSON.stringify(data1) === JSON.stringify(data2);
  }, []);

  const isDataInHistory = useCallback((data: string[][], history: string[][][]) => {
    return history.some(historicalData => isDataEqual(data, historicalData));
  }, [isDataEqual]);

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await axios.get(csvUrl);
        const newData = parseCSV(response.data);

        if (!isDataInHistory(newData, dataHistory)) {
          setDataHistory(prevHistory => [...prevHistory, newData]);
          setLastDataUpdate(new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
          setShowConfetti(true); // Trigger confetti on new data

          const newStaff = newData[2]?.[1] || '';
          const newCity = newData[1]?.[1] || '';
          const newCountry = newData[0]?.[1] || '';

          if (newStaff !== prevStaff && staffRef.current) {
            gsap.fromTo(
              staffRef.current,
              { scale: 1, color: '#000' },
              { scale: 1.2, color: '#e11915', duration: 2, yoyo: true, repeat: 3 }
            );
            setPrevStaff(newStaff);
          }

          if (newCity !== prevCity && cityRef.current) {
            gsap.fromTo(
              cityRef.current,
              { scale: 1, color: '#000' },
              { scale: 1.2, color: '#e11915', duration: 2, yoyo: true, repeat: 3 }
            );
            setPrevCity(newCity);
          }

          if (newCountry !== prevCountry && countryRef.current) {
            gsap.fromTo(
              countryRef.current,
              { scale: 1, color: '#000' },
              { scale: 1.2, color: '#e11915', duration: 2, yoyo: true, repeat: 3 }
            );
            setPrevCountry(newCountry);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCSVData();
    const intervalId = setInterval(fetchCSVData, 10000); // Fetch every 10 seconds

    return () => clearInterval(intervalId);
  }, [dataHistory, isDataInHistory, prevStaff, prevCity, prevCountry]); // Include previous values in dependencies

  const parseCSV = (csvText: string): string[][] => {
    const rows = csvText.split(/\r?\n/);
    return rows.slice(1).map(row => row.split(','));
  };

  const getLastUniqueData = () => {
    return dataHistory[dataHistory.length - 1] || [];
  };

  const lastUniqueData = getLastUniqueData().map(row => row.map(cell => cell.replace('"', '') + " zł"));

  // Automatically stop confetti after a short duration
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        if (confettiRef.current) {
          gsap.to(confettiRef.current, { opacity: 0, duration: 2, onComplete: () => setShowConfetti(false) });
        }
      }, 6000); // Start fade out after 6 seconds
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="App">
      {showConfetti && (
        <div ref={confettiRef}>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        </div>
      )}
      <div className={"text hour-state"}>{lastDataUpdate || 'No update yet'}</div>
      <div className={"text text-left-column staff"} ref={staffRef}>
        {lastUniqueData[2]?.[1] || ''}
      </div>
      <div className={"text text-left-column city"} ref={cityRef}>
        {lastUniqueData[1]?.[1] || ''}
      </div>
      <div className={"text text-left-column country"} ref={countryRef}>
        {lastUniqueData[0]?.[1] || ''}
      </div>

      <div className="sponsors">
        <img loading="lazy" src={require('./assets/sponsors-logos.gif')} alt="Sponsorzy" className="sponsors-logos" />
      </div>
    </div>
  );
}

export default App;
