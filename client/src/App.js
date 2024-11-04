import React, { useState } from 'react';
import axios from 'axios';
import CompactDisplay from './CompactDisplay';
import './App.css';

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [exactMatches, setExactMatches] = useState([]);
  const [possibleMatches, setPossibleMatches] = useState([]);
  const [companyMatches, setCompanyMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exactPage, setExactPage] = useState(0);
  const [possiblePage, setPossiblePage] = useState(0);
  const [companyPage, setCompanyPage] = useState(0);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setExactPage(0);
    setPossiblePage(0);
    setCompanyPage(0);
    setExactMatches([]);
    setPossibleMatches([]);
    setCompanyMatches([]);

    if (!firstName.trim() && !lastName.trim()) {
      alert("Please enter at least one search term");
      setLoading(false);
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const exactResponse = await axios.get(`http://localhost:5000/search/exact`, {
        params: { name: fullName }
      });
      const exactMatchesData = exactResponse.data.exactMatches.slice(0, 5) || [];
      setExactMatches(exactMatchesData);

      const exactMatchNames = exactMatchesData.map(match => match.name);

      const possibleResponse = await axios.get(`http://localhost:5000/search/possible`, {
        params: { firstName: firstName.trim(), lastName: lastName.trim(), exactMatches: exactMatchNames }
      });
      setPossibleMatches(possibleResponse.data.possibleMatches.slice(0,5) || []);

      const companyResponse = await axios.get(`http://localhost:5000/search/company`, {
        params:  { name: companyName.trim() }
      });
      setCompanyMatches(companyResponse.data.companyMatches.slice(0,5) || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = async (type) => {
    setLoading(true);
    setError('');

    try {
        if (type === 'exact') {
            const exactResponse = await axios.get(`http://localhost:5000/search/exact`, {
                params: { name: `${firstName.trim()} ${lastName.trim()}` }
            });
            const exactMatchesData = exactResponse.data.exactMatches.slice(exactPage * 5, (exactPage + 1) * 5) || [];
            setExactMatches(prev => [...prev, ...exactMatchesData]);
            setExactPage(prev => prev + 1);
        } else if (type === 'possible') {
            const possibleResponse = await axios.get(`http://localhost:5000/search/possible`, {
                params: { firstName: firstName.trim(), lastName: lastName.trim(), exactMatches: exactMatches.map(match => match.name) }
            });
            const possibleMatchesData = possibleResponse.data.possibleMatches.slice(possiblePage * 5, (possiblePage + 1) * 5) || [];
            setPossibleMatches(prev => [...prev, ...possibleMatchesData]);
            setPossiblePage(prev => prev + 1);
        } else if (type === 'company') {
            const companyResponse = await axios.get(`http://localhost:5000/search/company`, {
                params: { name: companyName.trim() }
            });
            const companyMatchesData = companyResponse.data.companyMatches.slice(companyPage * 5, (companyPage + 1) * 5) || [];
            setCompanyMatches(prev => [...prev, ...companyMatchesData]);
            setCompanyPage(prev => prev + 1);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
    setExactMatches([]);
    setPossibleMatches([]);
    setCompanyMatches([]);
  };

  return (
    <div className="App">
      <h1>User Info Form</h1>
      <div className="input-container">
        <input  //First Name Input
          type='text'
          value={firstName}
          onChange={handleInputChange(setFirstName)}
          placeholder="First Name"
        />
        <input //Last Name Input
          type='text'
          value={lastName}
          onChange={handleInputChange(setLastName)}
          placeholder="Last Name"
        />
        <input //Company Name Input
          type='text'
          value={companyName}
          onChange={handleInputChange(setCompanyName)}
          placeholder="Company Name"
        />
        {/*               Template For Additional Input/information for searching through sanctionlist
        <input                  Change From input type when integrating to the main database for
        type='text'                 fetching the customer information from the ticket/reciept
        value={______}
        onChange={handleInputChange(________)}
        placeholder="________"
        /> 
        */}
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className='error'>{error}</p>}

          {/* Result layout */}
      <div className="results-container" > 
        <div className="exact-matches">
          <h2>Exact Matches</h2>
          {exactMatches && exactMatches.length > 0 ? (
            <>
              <CompactDisplay results={exactMatches} />
              <button onClick={() => loadMoreResults('exact')} disabled={loading} >
                {loading ? 'Loading...' : 'More'}
              </button>
            </>
          ) : (
            <p className="no-matches">No exact matches found.</p>
          )}
        </div>
        <div className="possible-matches">
          <h2>Possible Matches</h2>
          {possibleMatches && possibleMatches.length > 0 ? (
            <>
              <CompactDisplay results={possibleMatches} />
              <button onClick={() => loadMoreResults('possible')} disabled={loading} >
                {loading ? 'Loading...' : 'More'}
              </button>
            </>
          ) : (
            <p className="no-matches">No possible matches found.</p>
          )}
        </div>
        <div className="company-matches">
          <h2>Company Matches</h2>
          {companyMatches.length > 0 ? (
            <>
              <CompactDisplay results={companyMatches} />
              <button onClick={() => loadMoreResults('company')} disabled={loading} >
                {loading ? 'Loading...' : 'More'}
              </button>
            </>
          ) : (
            <p className="no-matches">No possible matches found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;