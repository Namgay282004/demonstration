import React, { useState, useEffect } from 'react';

const BMICalculator = () => {
  const BASE_URL = 'https://bmi-backend-dev-2.onrender.com';
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bmi, setBmi] = useState(null);
  const [message, setMessage] = useState('');
  const [bmiHistory, setBmiHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('calculator');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchBMIHistory();
    }
  }, [activeTab]);

  const fetchBMIHistory = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${BASE_URL}/api/user/bmi`);
      if (res.ok) {
        const data = await res.json();
        setBmiHistory(data);
        setMessage('BMI history loaded successfully.');
      } else {
        throw new Error('Failed to fetch BMI history.');
      }
    } catch (err) {
      setMessage(err.message || 'Failed to load BMI history.');
      setBmiHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#4b6cb7' };
    if (bmiValue < 25) return { category: 'Normal weight', color: '#2e7d32' };
    if (bmiValue < 30) return { category: 'Overweight', color: '#d97706' };
    return { category: 'Obese', color: '#b91c1c' };
  };

  const getBMIAdvice = (bmiValue) => {
    if (bmiValue < 18.5) return 'Consider consulting a healthcare provider about healthy weight gain strategies.';
    if (bmiValue < 25) return 'You are in the healthy weight range. Maintain your current lifestyle.';
    if (bmiValue < 30) return 'Consider adopting healthier eating habits and increasing physical activity.';
    return 'Consult with a healthcare provider about weight management strategies.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const ageNum = age ? parseInt(age) : null;

    if (!heightNum || !weightNum) {
      setMessage('Please enter valid height and weight.');
      setLoading(false);
      return;
    }

    if (heightNum <= 0 || weightNum <= 0) {
      setMessage('Please enter positive values.');
      setLoading(false);
      return;
    }

    if (heightNum < 50 || heightNum > 300) {
      setMessage('Please enter a height between 50cm and 300cm.');
      setLoading(false);
      return;
    }

    if (weightNum < 10 || weightNum > 500) {
      setMessage('Please enter a weight between 10kg and 500kg.');
      setLoading(false);
      return;
    }

    if (ageNum && (ageNum < 1 || ageNum > 120)) {
      setMessage('Please enter an age between 1 and 120 years.');
      setLoading(false);
      return;
    }

    // Convert cm to meters for BMI calculation
    const heightInMeters = heightNum / 100;
    const bmiVal = +(weightNum / (heightInMeters * heightInMeters)).toFixed(2);
    setBmi(bmiVal);

    try {
      const res = await fetch(`${BASE_URL}/api/create/bmi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          height: heightInMeters, // Store in meters in database
          weight: weightNum,
          age: ageNum,
          bmi: bmiVal
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save BMI data.');
      }

      setMessage('BMI calculated and saved successfully.');
      setHeight('');
      setWeight('');
      setAge('');
      if (activeTab === 'history') {
        fetchBMIHistory();
      }
    } catch (err) {
      setMessage(err.message || 'Something went wrong while saving.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateOnly = () => {
    setMessage('');
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!heightNum || !weightNum) {
      setMessage('Please enter valid height and weight.');
      return;
    }

    if (heightNum <= 0 || weightNum <= 0) {
      setMessage('Please enter positive values.');
      return;
    }

    if (heightNum < 50 || heightNum > 300) {
      setMessage('Please enter a height between 50cm and 300cm.');
      return;
    }

    if (weightNum < 10 || weightNum > 500) {
      setMessage('Please enter a weight between 10kg and 500kg.');
      return;
    }

    // Convert cm to meters for BMI calculation
    const heightInMeters = heightNum / 100;
    const bmiVal = +(weightNum / (heightInMeters * heightInMeters)).toFixed(2);
    setBmi(bmiVal);
    setMessage('BMI calculated successfully (not saved).');
  };

  const clearForm = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setBmi(null);
    setMessage('');
  };

  const deleteBMIRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this BMI record?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/bmi/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete BMI record.');
      }

      setMessage('BMI record deleted successfully.');
      fetchBMIHistory();
    } catch (err) {
      setMessage(err.message || 'Failed to delete record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>BMI Calculator</h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px' }}>
        Calculate and track your Body Mass Index
      </p>
      
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('calculator')}
          style={{
            padding: '10px 20px',
            marginRight: '5px',
            border: 'none',
            backgroundColor: activeTab === 'calculator' ? '#e0e7ff' : 'transparent',
            color: activeTab === 'calculator' ? '#333' : '#555',
            cursor: 'pointer',
            fontSize: '14px',
            borderBottom: activeTab === 'calculator' ? '2px solid #4b6cb7' : 'none'
          }}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'history' ? '#e0e7ff' : 'transparent',
            color: activeTab === 'history' ? '#333' : '#555',
            cursor: 'pointer',
            fontSize: '14px',
            borderBottom: activeTab === 'history' ? '2px solid #4b6cb7' : 'none'
          }}
        >
          History
        </button>
      </div>

      {activeTab === 'calculator' && (
        <div>
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Enter Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Height (cm):</label>
                <input
                  type="number"
                  step="1"
                  min="50"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    fontSize: '14px'
                  }}
                  placeholder="e.g., 175"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Weight (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    fontSize: '14px'
                  }}
                  placeholder="e.g., 70.5"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Age (years):</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    fontSize: '14px'
                  }}
                  placeholder="e.g., 25"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleCalculateOnly}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Calculate
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4b6cb7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : 'Calculate & Save'}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#555',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {bmi !== null && (
            <div style={{ 
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '10px', color: '#333' }}>BMI Result</h3>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                BMI: <span style={{ color: getBMICategory(bmi).color }}>{bmi}</span>
              </div>
              <div style={{ fontSize: '16px', color: getBMICategory(bmi).color, marginBottom: '10px' }}>
                Category: {getBMICategory(bmi).category}
              </div>
              <p style={{ fontSize: '14px', color: '#555' }}>
                Advice: {getBMIAdvice(bmi)}
              </p>
              
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ marginBottom: '5px', color: '#333' }}>BMI Scale</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ padding: '5px 8px', backgroundColor: '#4b6cb7', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                    Underweight: &lt;18.5
                  </div>
                  <div style={{ padding: '5px 8px', backgroundColor: '#2e7d32', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                    Normal: 18.5-24.9
                  </div>
                  <div style={{ padding: '5px 8px', backgroundColor: '#d97706', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                    Overweight: 25-29.9
                  </div>
                  <div style={{ padding: '5px 8px', backgroundColor: '#b91c1c', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                    Obese: ≥30
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: message.includes('success') || message.includes('calculated') ? '#e6f4ea' : '#fee2e2',
              color: message.includes('success') || message.includes('calculated') ? '#2e7d32' : '#b91c1c',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>BMI History</h3>
            <button
              onClick={fetchBMIHistory}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4b6cb7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
              <div style={{ fontSize: '16px' }}>Loading...</div>
            </div>
          ) : bmiHistory.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '8px',
              color: '#555'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '10px' }}>No BMI records found</div>
              <button
                onClick={() => setActiveTab('calculator')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4b6cb7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f7ff', borderRadius: '4px', textAlign: 'center' }}>
                Total Records: {bmiHistory.length}
              </div>
              
              <div style={{ display: 'grid', gap: '15px' }}>
                {bmiHistory.map((record, index) => {
                  const category = getBMICategory(record.bmi);
                  // Convert stored meters back to cm for display
                  const heightInCm = Math.round(record.height * 100);
                  
                  return (
                    <div
                      key={record.id || index}
                      style={{
                        backgroundColor: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>BMI</div>
                          <div style={{ fontSize: '16px', color: category.color }}>
                            {record.bmi}
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>Category</div>
                          <div style={{ fontSize: '14px', color: category.color }}>
                            {category.category}
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>Height</div>
                          <div style={{ fontSize: '14px' }}>{heightInCm}cm</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>Weight</div>
                          <div style={{ fontSize: '14px' }}>{record.weight}kg</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>Age</div>
                          <div style={{ fontSize: '14px' }}>{record.age}</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>Date</div>
                          <div style={{ fontSize: '12px' }}>
                            {record.created_at ? new Date(record.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </div>

                        {record.id && (
                          <div style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => deleteBMIRecord(record.id)}
                              disabled={loading}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#b91c1c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        marginTop: '10px', 
                        padding: '8px', 
                        backgroundColor: '#f9f9f9', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#555'
                      }}>
                        Advice: {getBMIAdvice(record.bmi)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {message && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: message.includes('success') || message.includes('loaded') ? '#e6f4ea' : '#fee2e2',
              color: message.includes('success') || message.includes('loaded') ? '#2e7d32' : '#b91c1c',
              borderRadius: '4px',
              marginTop: '15px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BMICalculator;