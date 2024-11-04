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

  const handleSearch = async () => {
    setLoading(true);
    setError('');

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
            <CompactDisplay results={exactMatches} />
          ) : (
            <p className="no-matches">No exact matches found.</p>
          )}
        </div>
        <div className="possible-matches">
          <h2>Possible Matches</h2>
          {possibleMatches && possibleMatches.length > 0 ? (
            <CompactDisplay results={possibleMatches} />
          ) : (
            <p className="no-matches">No possible matches found.</p>
          )}
        </div>
        <div className="company-matches">
          <h2>Company Matches</h2>
          {companyMatches.length > 0 ? (
            <CompactDisplay results={companyMatches} />
          ) : (
            <p className="no-matches">No possible matches found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;