import React, { useState } from 'react';
import axios from 'axios';
import CompactDisplay from './CompactDisplay';
import './App.css';

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [exactMatches, setExactMatches] = useState([]);
  const [possibleMatches, setPossibleMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setExactMatches([]);
    setPossibleMatches([]);

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
      const exactMatchesData = exactResponse.data.exactMatches || [];
      setExactMatches(exactMatchesData);

      const exactMatchNames = exactMatchesData.map(match => match.name);

      const possibleResponse = await axios.get(`http://localhost:5000/search/possible`, {
        params: { firstName: firstName.trim(), lastName: lastName.trim(), exactMatches: exactMatchNames }
      });
      setPossibleMatches(possibleResponse.data.possibleMatches || []);
      
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